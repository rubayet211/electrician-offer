import { createHash, randomBytes, randomUUID } from "node:crypto";
import { parsedClientConfig as config } from "@/config/client.config";
import { aiInquirySchema, inquirySchema } from "./schema";
import { isSpam } from "@/lib/security/spam";
import { validateUploads } from "@/lib/uploads/validate";
import { getStore } from "@/lib/store";
import type { Lead, Store } from "@/lib/store/types";
import { sendLeadNotificationEmail } from "@/lib/notifications/email";
import { logEvent } from "@/lib/log";
export type InquiryResult = {
  ok: boolean;
  status: number;
  reference?: string;
  duplicate?: boolean;
  notification: "queued" | "demo" | "none";
  warnings: string[];
  fieldErrors?: Record<string, string[]>;
};
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const reference = () => `EL-${Array.from(randomBytes(6), (b) => alphabet[b & 31]).join("")}`;
export async function submitInquiry(
  raw: unknown,
  ctx: {
    ipHash: string;
    source: "contact_form" | "ai_chat";
    files?: File[];
    now?: Date;
    store?: Store;
  },
): Promise<InquiryResult> {
  const fallback: InquiryResult = {
    ok: false,
    status: 400,
    notification: "none",
    warnings: [],
  };
  const parsed = (ctx.source === "ai_chat" ? aiInquirySchema : inquirySchema).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ...fallback, fieldErrors };
  }
  const data = parsed.data,
    now = ctx.now ?? new Date();
  if (
    data.company_website?.trim() ||
    (ctx.source === "contact_form" && isSpam(data.company_website, data.formStartedAt, +now))
  )
    return { ...fallback, fieldErrors: { form: ["Unable to accept this request."] } };
  try {
    const store = ctx.store ?? getStore();
    if (!(await store.rateLimit.hit(`inquiry:${ctx.ipHash}`, 5, 600000)).allowed)
      return { ...fallback, status: 429 };
    const replay = await store.leads.findByIdempotencyKey(data.idempotencyKey);
    if (replay)
      return {
        ...fallback,
        ok: true,
        status: 200,
        reference: replay.reference,
        warnings: ctx.files?.length ? ["Photos could not be attached"] : [],
        notification: replay.isDemo ? "demo" : "queued",
      };
    const hash = createHash("sha256").update(
        [
          data.phone,
          data.serviceSlug,
          data.description.trim().toLowerCase().replace(/\s+/g, " "),
        ].join("|"),
      ),
      dedupeHash = hash.digest("hex");
    const duplicate = await store.leads.findDuplicate(dedupeHash, 15, now);
    if (duplicate)
      return {
        ...fallback,
        ok: true,
        status: 200,
        reference: duplicate.reference,
        warnings: ctx.files?.length ? ["Photos could not be attached"] : [],
        duplicate: true,
        notification: duplicate.isDemo ? "demo" : "queued",
      };
    let uploads: Awaited<ReturnType<typeof validateUploads>>;
    try {
      uploads = await validateUploads(ctx.files ?? []);
    } catch {
      uploads = { files: [], warnings: ["Photos could not be attached"] };
    }
    const id = randomUUID(),
      createdAt = now.toISOString();
    const lead: Lead = {
      ...data,
      id,
      reference: reference(),
      createdAt,
      source: ctx.source,
      ipHash: ctx.ipHash,
      isDemo: config.mode === "demo",
      status: "new",
      notificationStatus: "pending",
      notificationAttempts: 0,
      dedupeHash,
      photoCount: uploads.files.length,
    };
    const attachments = uploads.files.map((file) => ({
      ...file,
      id: randomUUID(),
      leadId: id,
      createdAt,
    }));
    let saved: Lead;
    try {
      saved = await store.leads.create(lead, attachments);
    } catch (error) {
      if (!attachments.length) throw error;
      lead.photoCount = 0;
      uploads.warnings.push("Photos could not be attached");
      saved = await store.leads.create(lead, []);
    }
    if (saved.id !== id)
      return {
        ...fallback,
        ok: true,
        status: 200,
        reference: saved.reference,
        warnings: ctx.files?.length ? ["Photos could not be attached"] : [],
        duplicate: saved.idempotencyKey !== data.idempotencyKey || undefined,
        notification: saved.isDemo ? "demo" : "queued",
      };
    try {
      if (lead.isDemo) await store.leads.setNotification(id, "skipped_demo");
      else if (await store.leads.claimNotification(id, new Date())) {
        const result = await sendLeadNotificationEmail(lead);
        await store.leads.finishNotification(
          id,
          result.ok ? "sent" : "failed",
          result.error,
          result.providerId,
        );
      }
    } catch {
      logEvent("notify_error", lead.reference);
    }
    return {
      ...fallback,
      ok: true,
      status: 201,
      reference: lead.reference,
      notification: lead.isDemo ? "demo" : "queued",
      warnings: uploads.warnings,
    };
  } catch (error) {
    logEvent("inquiry_error", undefined, error);
    return { ...fallback, status: 503 };
  }
}
