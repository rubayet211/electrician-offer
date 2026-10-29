import { parsedClientConfig as config } from "@/config/client.config";
import { FORM_FIELDS_BY_TYPE } from "@/lib/inquiries/schema";
import { getStore } from "@/lib/store";
import type { Lead, Store } from "@/lib/store/types";
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
export async function sendLeadNotificationEmail(
  lead: Lead,
): Promise<{ ok: boolean; providerId?: string; error?: string }> {
  if (lead.isDemo) return { ok: true };
  if (lead.isTest && !config.notifications.stagingRecipients?.length)
    return { ok: false, error: "MissingStagingRecipients" };
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "MissingApiKey" };
  try {
    const inquiryDetails = lead.details;
    const details = Object.entries(inquiryDetails ?? {})
      .filter(([key, value]) => key !== "formType" && value)
      .map(([key, value]) => {
        const fields: readonly {
          name: string;
          label: string;
          options?: readonly { value: string; label: string }[];
        }[] = inquiryDetails ? FORM_FIELDS_BY_TYPE[inquiryDetails.formType] : [];
        const field = fields.find((f) => f.name === key);
        return `${field?.label ?? key}: ${field?.options?.find((o) => o.value === value)?.label ?? String(value)}`;
      });
    const lines = [
      `Reference: ${lead.reference}`,
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email || "Not provided"}`,
      `Service: ${config.services.find((s) => s.slug === lead.serviceSlug)?.title ?? lead.serviceSlug}`,
      `Description: ${lead.description}`,
      ...details,
      `Location: ${[lead.zip, lead.location].filter(Boolean).join(" ")}`,
      `Urgency: ${lead.urgency}`,
      `Photos: ${lead.photoCount}`,
      `Admin: https://${config.business.domain}/admin/leads/${encodeURIComponent(lead.id)}`,
      `Source: ${lead.source}`,
      `Submitted: ${new Date(lead.createdAt).toLocaleString("en-US", { timeZone: config.business.timezone })}`,
    ];
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": lead.id,
      },
      body: JSON.stringify({
        from: config.notifications.fromAddress,
        to: lead.isTest ? config.notifications.stagingRecipients : config.notifications.recipients,
        subject: `Estimate request ${lead.reference}`,
        text: lines.join("\n"),
        html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(""),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { ok: false, error: `ProviderHttp${response.status}` };
    const data: unknown = await response.json();
    return {
      ok: true,
      providerId:
        typeof data === "object" && data !== null && "id" in data && typeof data.id === "string"
          ? data.id
          : undefined,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.name : "UnknownError" };
  }
}
export async function retryPendingNotifications(
  limit: number,
  store: Store = getStore(),
): Promise<number> {
  const deadline = Date.now() + 48000;
  const leads = await store.leads.list(
    { notificationStatus: ["pending", "failed", "sending"], retryBefore: new Date() },
    { limit: Math.min(limit, 15) },
  );
  let attempted = 0;
  for (const lead of leads) {
    if (Date.now() >= deadline) break;
    if (lead.isDemo) {
      await store.leads.setNotification(lead.id, "skipped_demo");
      continue;
    }
    if (lead.isTest && !config.notifications.stagingRecipients?.length) {
      await store.leads.setNotification(lead.id, "skipped_test");
      continue;
    }
    if (lead.notificationAttempts >= 5) {
      await store.leads.setNotification(lead.id, "failed_final");
      continue;
    }
    if (
      lead.notificationStatus !== "sending" &&
      lead.notificationLastAttemptAt &&
      Date.now() - +new Date(lead.notificationLastAttemptAt) <
        Math.min(3600000, 60000 * 2 ** lead.notificationAttempts)
    )
      continue;
    if (!(await store.leads.claimNotification(lead.id, new Date()))) continue;
    const result = await sendLeadNotificationEmail(lead);
    await store.leads.finishNotification(
      lead.id,
      result.ok ? "sent" : "failed",
      result.error,
      result.providerId,
    );
    attempted++;
  }
  return attempted;
}
