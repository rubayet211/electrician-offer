import { randomUUID } from "node:crypto";
import { readBody } from "@/lib/http/read-body";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessageChunk,
} from "ai";
import { parsedClientConfig as config } from "@/config/client.config";
import { getAIConfig, getAIStatus, monthKey } from "@/lib/ai/config";
import { createAIModel } from "@/lib/ai/provider";
import { createMockModel } from "@/lib/ai/mock-model";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { createEstimateTool } from "@/lib/ai/tools";
import { isElectricalHazard, safetyReply } from "@/lib/ai/safety";
import { guardAssistantText } from "@/lib/ai/output-guard";
import {
  openSession,
  reserveConversation,
  settleConversation,
  signSession,
  sessionFromCookie,
} from "@/lib/ai/quota";
import { getStore } from "@/lib/store";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp } from "@/lib/security/client-ip";
import { hashIp } from "@/lib/security/hash";
import { logEvent } from "@/lib/log";

// Hazard replies cannot depend on the database. This per-process limit bounds abuse;
// deployments should also enforce a shared edge rate limit across instances.
const hazardLimits = new Map<string, { count: number; expires: number }>();
function allowHazard(ip: string): boolean {
  const now = Date.now();
  for (const [key, value] of hazardLimits) if (value.expires <= now) hazardLimits.delete(key);
  const current = hazardLimits.get(ip);
  if (!current) {
    if (hazardLimits.size >= 10000) hazardLimits.delete(hazardLimits.keys().next().value!);
    hazardLimits.set(ip, { count: 1, expires: now + 60000 });
    return true;
  }
  return ++current.count <= 30;
}

function parseMessages(value: unknown): ModelMessage[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const messages: ModelMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const entry = item as Record<string, unknown>;
    if (entry.role === "system" || entry.role === "assistant") continue;
    if (entry.role !== "user" && entry.role !== "assistant") return null;
    let content: string;
    if (typeof entry.content === "string") content = entry.content;
    else if (Array.isArray(entry.parts)) {
      const parts = entry.parts.filter(
        (part): part is { type: "text"; text: string } =>
          !!part &&
          typeof part === "object" &&
          part.type === "text" &&
          typeof part.text === "string",
      );
      content = parts.map((part) => part.text).join("\n");
    } else return null;
    if (content.length > 4000) return null;
    if (content.trim()) messages.push({ role: entry.role, content });
  }
  const last = value.at(-1);
  if (!last || typeof last !== "object" || last.role !== "user" || !messages.length) return null;
  let remaining = 8000;
  const recent: ModelMessage[] = [];
  for (const message of messages.slice(-20).reverse()) {
    const content = message.content as string;
    if (!remaining) break;
    recent.unshift({ role: "user", content: content.slice(-remaining) });
    remaining -= Math.min(content.length, remaining);
  }
  return recent;
}

function cookieHeader(id: string): string {
  return `ai_sid=${signSession(id)}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
function cookieValue(request: Request): string | undefined {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("ai_sid="))
    ?.slice(7);
}
function unavailable(reason: string, status: number, cookie?: string): Response {
  return Response.json(
    { unavailable: true, reason },
    {
      status,
      headers: {
        ...(cookie ? { "Set-Cookie": cookie } : {}),
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}

export async function GET(request: Request): Promise<Response> {
  try {
    const ipHash = hashIp(clientIp(request));
    if (!(await getStore().rateLimit.hit(`ai-status:${ipHash}`, 30, 60000)).allowed)
      return Response.json({ available: false, reason: "unavailable" }, { status: 429 });
    let status = await getAIStatus();
    if (status.reason === "quota_exhausted") {
      const id = sessionFromCookie(cookieValue(request));
      const existing = id ? await getStore().aiSessions.get(id) : null;
      const usage = await getStore().aiUsage.getMonth(monthKey());
      if (
        (usage?.costUsd ?? 0) < getAIConfig().monthlyCostCapUsd &&
        existing?.counted &&
        Date.now() - +new Date(existing.lastActivityAt) <=
          getAIConfig().sessionInactivityMinutes * 60000
      )
        status = { available: true };
    }
    return Response.json({
      available: status.available,
      ...(!status.available
        ? { reason: status.reason === "quota_exhausted" ? "quota_exhausted" : "unavailable" }
        : {}),
      displayName: config.ai.displayName,
      isDemo: config.mode === "demo",
      isSimulated: getAIConfig().simulated,
    });
  } catch {
    return Response.json(
      {
        available: false,
        reason: "unavailable",
        displayName: config.ai.displayName,
        isDemo: config.mode === "demo",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const settings = getAIConfig();
  if (!isAllowedOrigin(request))
    return Response.json({ error: "Origin not allowed." }, { status: 403 });
  let messages: ModelMessage[] | null;
  try {
    const body = await readBody(request, 200000);
    if (body === null) return Response.json({ error: "Invalid request." }, { status: 400 });
    messages = parseMessages(
      (JSON.parse(new TextDecoder().decode(body)) as { messages?: unknown }).messages,
    );
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!messages) return Response.json({ error: "Invalid messages." }, { status: 400 });
  const last = messages.at(-1)!;
  const text = typeof last.content === "string" ? last.content : "";
  if (isElectricalHazard(text)) {
    if (!allowHazard(clientIp(request))) return unavailable("rate_limited", 429);
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: "text-start", id: "safety" });
        writer.write({
          type: "text-delta",
          id: "safety",
          delta: safetyReply(config.business.phone),
        });
        writer.write({ type: "text-end", id: "safety" });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }
  if (!settings.enabled) return unavailable("disabled", 503);
  try {
    const store = getStore();
    const ipHash = hashIp(clientIp(request));
    if (!(await store.rateLimit.hit(`ai-chat:${ipHash}`, 8, 60000)).allowed)
      return unavailable("rate_limited", 429);
    if (((await store.aiUsage.getMonth(monthKey()))?.costUsd ?? 0) >= settings.monthlyCostCapUsd)
      return unavailable("quota_exhausted", 429);
    if ((await store.rateLimit.count(`ai-failures:${ipHash}`, 86400000)) >= 10)
      return unavailable("rate_limited", 429);
    const session = await openSession(store, cookieValue(request), ipHash);
    if (!session) return unavailable("visitor_limit", 429);
    const cookie = cookieHeader(session.id);
    const requestId = randomUUID();
    if (!(await store.aiSessions.beginRequest(session.id, requestId, new Date())))
      return unavailable("in_flight", 409, cookie);
    try {
      const count = await store.aiSessions.incrementMessages(session.id);
      if (!count || count > settings.maxVisitorMessagesPerConversation)
        return unavailable("message_limit", 429, cookie);
      if (!settings.simulated && !process.env.OPENROUTER_API_KEY)
        return unavailable("missing_key", 503, cookie);
      if (!(await reserveConversation(store, session.id, settings.monthlyConversationAllowance)))
        return unavailable("quota_exhausted", 429, cookie);
      const usageMonth = (await store.aiSessions.get(session.id))?.month ?? session.month;
      let failed = false;
      let failureObserved = false;
      let producedText = false;
      let usageRecorded = false;
      const fail = async () => {
        if (failed) return;
        failed = true;
        await store.rateLimit.hit(`ai-failures:${ipHash}`, 10, 86400000);
        await settleConversation(store, session.id, producedText);
        await store.aiUsage.addUsage(usageMonth, 0, 0, 0, 1);
      };
      try {
        const result = streamText({
          model: settings.simulated ? createMockModel() : createAIModel(),
          system: `${buildSystemPrompt()}\nServer recap: This conversation has ${count - 1} earlier visitor messages. Previous assistant replies are not stored.`,
          messages,
          tools: { prepare_estimate_request: createEstimateTool(session.id, store) },
          maxOutputTokens: settings.maxOutputTokens,
          temperature: settings.temperature,
          maxRetries: 0,
          abortSignal: AbortSignal.any([request.signal, AbortSignal.timeout(settings.timeoutMs)]),
          onChunk: ({ chunk }) => {
            if (chunk.type === "text-delta" && chunk.text) producedText = true;
          },
          onError: () => {
            failureObserved = true;
          },
          onAbort: async ({ steps }) => {
            for (const step of steps) {
              const metadata = step.providerMetadata?.openrouter?.usage;
              const cost =
                metadata &&
                typeof metadata === "object" &&
                !Array.isArray(metadata) &&
                typeof (metadata as Record<string, unknown>).cost === "number"
                  ? (metadata as Record<string, number>).cost
                  : undefined;
              const input = step.usage.inputTokens ?? 0,
                output = step.usage.outputTokens ?? 0;
              if (cost === undefined && (input || output)) logEvent("cost_missing");
              await store.aiUsage.addUsage(usageMonth, input, output, cost ?? 0);
            }
            usageRecorded = true;
            failureObserved = true;
          },
          onFinish: async (event) => {
            if (!usageRecorded) {
              const metadata = event.providerMetadata?.openrouter?.usage;
              const cost =
                metadata &&
                typeof metadata === "object" &&
                !Array.isArray(metadata) &&
                typeof (metadata as Record<string, unknown>).cost === "number"
                  ? (metadata as Record<string, number>).cost
                  : undefined;
              const input = event.usage.inputTokens ?? 0,
                output = event.usage.outputTokens ?? 0;
              if (cost === undefined && (input || output)) logEvent("cost_missing");
              await store.aiUsage.addUsage(usageMonth, input, output, cost ?? 0);
              usageRecorded = true;
            }
            if (
              failureObserved ||
              event.finishReason === "error" ||
              (!event.text && event.toolCalls.length === 0)
            ) {
              failureObserved = true;
              return;
            }
            await settleConversation(store, session.id, true);
          },
        });
        const reader = result
          .toUIMessageStream({
            onError: () => "Assistant unavailable. Please call or use the contact form.",
          })
          .getReader();
        const chunks: UIMessageChunk[] = [];
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          if (part.value.type === "error") failureObserved = true;
          if (part.value.type === "text-delta" && part.value.delta) producedText = true;
          chunks.push(part.value);
        }
        if (failureObserved) {
          await fail();
          return unavailable("model_error", 503, cookie);
        }
        const text = chunks
          .filter((part) => part.type === "text-delta")
          .map((part) => part.delta)
          .join("");
        const approved = config.credentials.licenses
          .filter((license) => license.status === "verified")
          .map((license) => license.number);
        const safe = guardAssistantText(text, approved);
        if (safe !== text) {
          let first = true;
          for (const part of chunks) {
            if (part.type === "text-delta") {
              part.delta = first ? safe : "";
              first = false;
            }
          }
        }
        const stream = new ReadableStream<UIMessageChunk>({
          start(controller) {
            for (const chunk of chunks) controller.enqueue(chunk);
            controller.close();
          },
        });
        return createUIMessageStreamResponse({ stream, headers: { "Set-Cookie": cookie } });
      } catch {
        await fail();
        return unavailable("model_error", 503, cookie);
      }
    } finally {
      await store.aiSessions.endRequest(session.id, requestId);
    }
  } catch {
    return unavailable("unavailable", 503);
  }
}
