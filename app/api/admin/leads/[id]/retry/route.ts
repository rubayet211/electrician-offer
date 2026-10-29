import { assertAdminApi } from "@/lib/security/admin-session";
import { isAllowedOrigin } from "@/lib/security/origin";
import { getStore } from "@/lib/store";
import { sendLeadNotificationEmail } from "@/lib/notifications/email";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const id = (await params).id;
  const store = getStore();
  const lead = await store.leads.get(id);
  if (!lead) return new Response(null, { status: 404 });
  if (
    !lead.isDemo &&
    ["failed", "pending"].includes(lead.notificationStatus) &&
    (await store.leads.claimNotification(id, new Date()))
  ) {
    const result = await sendLeadNotificationEmail(lead);
    await store.leads.finishNotification(
      id,
      result.ok ? "sent" : "failed",
      result.error,
      result.providerId,
    );
  }
  return Response.redirect(new URL(`/admin/leads/${encodeURIComponent(id)}`, req.url), 303);
}
