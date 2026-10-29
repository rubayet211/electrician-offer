import { assertAdminApi } from "@/lib/security/admin-session";
import { isAllowedOrigin } from "@/lib/security/origin";
import { getStore } from "@/lib/store";
import { parsedClientConfig } from "@/config/client.config";
import { sendLeadNotificationEmail } from "@/lib/notifications/email";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const id = (await params).id;
  const store = getStore();
  const lead = await store.leads.get(id);
  if (!lead) return new Response(null, { status: 404 });
  let outcome = "unavailable";
  if (await store.leads.claimNotification(id, new Date(), true)) {
    if (lead.isTest && !parsedClientConfig.notifications.stagingRecipients?.length) {
      await store.leads.setNotification(id, "skipped_test");
      return Response.redirect(
        new URL(`/admin/leads/${encodeURIComponent(id)}?retry=skipped`, req.url),
        303,
      );
    }
    const result = await sendLeadNotificationEmail(lead);
    outcome = result.ok ? "sent" : "failed";
    await store.leads.finishNotification(
      id,
      result.ok ? "sent" : "failed",
      result.error,
      result.providerId,
    );
  }
  return Response.redirect(
    new URL(`/admin/leads/${encodeURIComponent(id)}?retry=${outcome}`, req.url),
    303,
  );
}
