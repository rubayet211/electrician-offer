import { z } from "zod";
import { submitInquiry } from "@/lib/inquiries/service";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp } from "@/lib/security/client-ip";
import { hashIp } from "@/lib/security/hash";
import { getStore } from "@/lib/store";
import { sessionFromCookie } from "@/lib/ai/quota";

const schema = z
  .object({ draftToken: z.uuid(), consent: z.literal(true), idempotencyKey: z.uuid() })
  .strict();
export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request))
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  try {
    const text = await request.text();
    if (text.length > 4096) return Response.json({ error: "Invalid request." }, { status: 400 });
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return Response.json({ error: "Consent and a valid request are required." }, { status: 400 });
    const cookie = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("ai_sid="))
      ?.slice(7);
    const sessionId = sessionFromCookie(cookie);
    if (!sessionId) return Response.json({ error: "Request not found." }, { status: 404 });
    const store = getStore();
    const ipHash = hashIp(clientIp(request));
    if (!(await store.rateLimit.hit(`ai-confirm:${ipHash}`, 8, 60000)).allowed)
      return Response.json({ error: "Please try again later." }, { status: 429 });
    const draft = await store.aiDrafts.claim(
      parsed.data.draftToken,
      sessionId,
      parsed.data.idempotencyKey,
    );
    if (!draft || typeof draft !== "object")
      return Response.json({ error: "Request not found or expired." }, { status: 404 });
    const result = await submitInquiry(
      { ...draft, consent: true, idempotencyKey: parsed.data.idempotencyKey },
      { source: "ai_chat", ipHash, store },
    );
    const { status, ...body } = result;
    return Response.json(body, { status });
  } catch {
    return Response.json(
      { error: "Unable to send request. Please call or use the contact form." },
      { status: 503 },
    );
  }
}
