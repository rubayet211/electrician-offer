import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessageChunk,
} from "ai";
import { parsedClientConfig as config } from "@/config/client.config";
import { getAIConfig, getAIStatus } from "@/lib/ai/config";
import { createAIModel } from "@/lib/ai/provider";
import { createMockModel } from "@/lib/ai/mock-model";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { createEstimateTool } from "@/lib/ai/tools";
import { isElectricalHazard, safetyReply } from "@/lib/ai/safety";
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

function parseMessages(value: unknown): ModelMessage[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const messages: ModelMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const entry = item as Record<string, unknown>;
    if (entry.role === "system") continue;
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
  return messages.at(-1)?.role === "user" ? messages.slice(-20) : null;
}

async function readBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get("content-length")) > 200000 || !request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let result = "";
  while (true) {
    const part = await reader.read();
    if (part.done) return result + decoder.decode();
    size += part.value.byteLength;
    if (size > 200000) {
      await reader.cancel();
      return null;
    }
    result += decoder.decode(part.value, { stream: true });
  }
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
    { status, headers: cookie ? { "Set-Cookie": cookie } : undefined },
  );
}

export async function GET(request: Request): Promise<Response> {
  try {
    let status = await getAIStatus();
    if (status.reason === "quota_exhausted") {
      const id = sessionFromCookie(cookieValue(request));
      const existing = id ? await getStore().aiSessions.get(id) : null;
      if (
        existing?.counted &&
        Date.now() - +new Date(existing.lastActivityAt) <=
          getAIConfig().sessionInactivityMinutes * 60000
      )
        status = { available: true };
    }
    return Response.json({
      ...status,
      displayName: config.ai.displayName,
      isDemo: config.mode === "demo",
      isSimulated: getAIConfig().simulated,
    });
  } catch {
    return Response.json(
      { available: false, displayName: config.ai.displayName, isDemo: config.mode === "demo" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const settings = getAIConfig();
  if (!settings.enabled) return unavailable("disabled", 503);
  if (!isAllowedOrigin(request))
    return Response.json({ error: "Origin not allowed." }, { status: 403 });
  let messages: ModelMessage[] | null;
  try {
    const body = await readBody(request);
    if (body === null) return Response.json({ error: "Invalid request." }, { status: 400 });
    messages = parseMessages((JSON.parse(body) as { messages?: unknown }).messages);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!messages) return Response.json({ error: "Invalid messages." }, { status: 400 });
  try {
    const store = getStore();
    await store.aiUsage.releaseStale(new Date(Date.now() - 600000));
    const ipHash = hashIp(clientIp(request));
    const session = await openSession(store, cookieValue(request), ipHash);
    if (!session) return unavailable("visitor_limit", 429);
    const cookie = cookieHeader(session.id);
    if (!(await store.rateLimit.hit(`ai-chat:${ipHash}`, 8, 60000)).allowed)
      return unavailable("rate_limited", 429, cookie);
    const count = await store.aiSessions.incrementMessages(session.id);
    if (!count || count > settings.maxVisitorMessagesPerConversation)
      return unavailable("message_limit", 429, cookie);
    const last = messages.at(-1)!;
    const text = typeof last.content === "string" ? last.content : "";
    if (isElectricalHazard(text)) {
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
      return createUIMessageStreamResponse({ stream, headers: { "Set-Cookie": cookie } });
    }
    if (!settings.simulated && !process.env.OPENROUTER_API_KEY)
      return unavailable("missing_key", 503, cookie);
    if (!(await reserveConversation(store, session.id, settings.monthlyConversationAllowance)))
      return unavailable("quota_exhausted", 429, cookie);
    const usageMonth = (await store.aiSessions.get(session.id))?.month ?? session.month;
    let failed = false;
    const fail = async () => {
      if (failed) return;
      failed = true;
      await settleConversation(store, session.id, false);
      await store.aiUsage.addUsage(usageMonth, 0, 0, 0, 1);
    };
    try {
      const result = streamText({
        model: settings.simulated ? createMockModel() : createAIModel(),
        system: buildSystemPrompt(),
        messages,
        tools: { prepare_estimate_request: createEstimateTool(session.id, store) },
        maxOutputTokens: settings.maxOutputTokens,
        temperature: settings.temperature,
        maxRetries: 0,
        abortSignal: AbortSignal.any([request.signal, AbortSignal.timeout(settings.timeoutMs)]),
        onError: fail,
        onAbort: fail,
        onFinish: async (event) => {
          if (
            failed ||
            event.finishReason === "error" ||
            (!event.text && event.toolCalls.length === 0)
          ) {
            await fail();
            return;
          }
          await settleConversation(store, session.id, true);
          const metadata = event.providerMetadata?.openrouter?.usage;
          const cost =
            metadata &&
            typeof metadata === "object" &&
            !Array.isArray(metadata) &&
            typeof (metadata as Record<string, unknown>).cost === "number"
              ? (metadata as Record<string, number>).cost
              : 0;
          await store.aiUsage.addUsage(
            usageMonth,
            event.usage.inputTokens ?? 0,
            event.usage.outputTokens ?? 0,
            cost,
          );
        },
      });
      const reader = result
        .toUIMessageStream({
          onError: () => "Assistant unavailable. Please call or use the contact form.",
        })
        .getReader();
      const buffered: UIMessageChunk[] = [];
      while (true) {
        const part = await reader.read();
        if (part.done || part.value.type === "error") {
          await fail();
          await reader.cancel();
          return unavailable("model_error", 503, cookie);
        }
        buffered.push(part.value);
        if (part.value.type === "text-delta" || part.value.type === "tool-output-available") break;
      }
      const stream = new ReadableStream<UIMessageChunk>({
        async start(controller) {
          for (const part of buffered) controller.enqueue(part);
        },
        async pull(controller) {
          try {
            const part = await reader.read();
            if (part.done) controller.close();
            else controller.enqueue(part.value);
          } catch (error) {
            await fail();
            controller.error(error);
          }
        },
        async cancel() {
          await reader.cancel();
          await fail();
        },
      });
      return createUIMessageStreamResponse({ stream, headers: { "Set-Cookie": cookie } });
    } catch {
      await fail();
      return unavailable("model_error", 503, cookie);
    }
  } catch {
    return unavailable("unavailable", 503);
  }
}
