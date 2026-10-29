import { randomUUID } from "node:crypto";
import { tool } from "ai";
import { z } from "zod";
import { aiInquirySchema, inquiryBaseSchema } from "@/lib/inquiries/schema";
import type { Store } from "@/lib/store/types";

export const estimateFieldsSchema = inquiryBaseSchema
  .pick({
    name: true,
    phone: true,
    zip: true,
    serviceSlug: true,
    description: true,
    urgency: true,
    email: true,
  })
  .extend({ zip: z.string().regex(/^\d{5}$/) });

export async function prepareEstimateRequest(
  input: unknown,
  sessionId: string,
  store: Store,
  now = new Date(),
) {
  const parsed = aiInquirySchema.safeParse({
    ...(input && typeof input === "object" ? input : {}),
    consent: true,
    idempotencyKey: randomUUID(),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues)
      (fieldErrors[issue.path.join(".") || "form"] ??= []).push(issue.message);
    return { status: "invalid" as const, fieldErrors };
  }
  const draftToken = randomUUID();
  const { consent: _consent, idempotencyKey: _key, ...summary } = parsed.data;
  void _consent;
  void _key;
  await store.aiDrafts.create({
    token: draftToken,
    sessionId,
    payload: summary,
    expiresAt: new Date(+now + 900000).toISOString(),
  });
  return { status: "awaiting_visitor_confirmation" as const, draftToken, summary };
}

export function createEstimateTool(sessionId: string, store: Store) {
  return tool({
    description:
      "Prepare an estimate request for visitor review and confirmation. Never submits a lead.",
    inputSchema: estimateFieldsSchema,
    execute: (input) => prepareEstimateRequest(input, sessionId, store),
  });
}
