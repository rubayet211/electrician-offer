import { readBody } from "@/lib/http/read-body";
import { z } from "zod";
import { submitInquiry } from "@/lib/inquiries/service";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp } from "@/lib/security/client-ip";
import { hashIp } from "@/lib/security/hash";
import { getStore } from "@/lib/store";
import { sessionFromCookie } from "@/lib/ai/quota";

const schema = z.union([
  z.object({ action: z.literal("revoke"), draftToken: z.uuid() }).strict(),
  z
    .object({
      draftToken: z.uuid(),
      consent: z.literal(true),
      idempotencyKey: z.uuid(),
      note: z.string().trim().max(500).optional(),
    })
    .strict(),
]);
export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request))
    return Response.json(
      { error: "Request origin is not allowed.", notification: "none" },
      { status: 403 },
    );
  try {
    const bytes = await readBody(request, 4096);
    if (!bytes)
      return Response.json({ error: "Invalid request.", notification: "none" }, { status: 413 });
    const text = new TextDecoder().decode(bytes);
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return Response.json(
        { error: "Consent and a valid request are required.", notification: "none" },
        { status: 400 },
      );
    const cookie = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("ai_sid="))
      ?.slice(7);
    const sessionId = sessionFromCookie(cookie);
    if (!sessionId)
      return Response.json({ error: "Request not found.", notification: "none" }, { status: 404 });
    const store = getStore();
    const ipHash = hashIp(clientIp(request));
    if (!(await store.rateLimit.hit(`ai-confirm:${ipHash}`, 8, 60000)).allowed)
      return Response.json(
        { error: "Please try again later.", notification: "none" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    if ("action" in parsed.data) {
      const revoked = await store.aiDrafts.consume(parsed.data.draftToken, sessionId);
      return Response.json({ ok: !!revoked }, { status: revoked ? 200 : 404 });
    }
    const draft = await store.aiDrafts.claim(
      parsed.data.draftToken,
      sessionId,
      parsed.data.idempotencyKey,
    );
    if (!draft || typeof draft !== "object")
      return Response.json(
        { error: "Request not found or expired.", notification: "none" },
        { status: 404 },
      );
    const result = await submitInquiry(
      {
        ...draft,
        ...(parsed.data.note
          ? {
              description: `${"description" in draft ? String(draft.description) : ""}\n\nVisitor note: ${parsed.data.note}`,
            }
          : {}),
        consent: true,
        idempotencyKey: parsed.data.idempotencyKey,
      },
      { source: "ai_chat", ipHash, store },
    );
    const { status, ...body } = result;
    return Response.json(body, {
      status,
      headers: status === 429 ? { "Retry-After": "600" } : undefined,
    });
  } catch {
    return Response.json(
      {
        error: "Unable to send request. Please call or use the contact form.",
        notification: "none",
      },
      { status: 503 },
    );
  }
}
