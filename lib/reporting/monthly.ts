import { parsedClientConfig } from "@/config/client.config";
import { getStore } from "@/lib/store";
import type { Lead, Store } from "@/lib/store/types";
import { monthBounds } from "@/lib/reporting/time";
export { monthBounds } from "@/lib/reporting/time";
export async function allLeads(store: Store): Promise<Lead[]> {
  const result: Lead[] = [];
  for (let offset = 0; ; offset += 500) {
    const batch = await store.leads.list({}, { limit: 500, offset });
    result.push(...batch);
    if (batch.length < 500) return result;
  }
}
export async function monthlyReport(
  month: string,
  store = getStore(),
  excludeDemo = parsedClientConfig.mode === "production",
) {
  const [start, end] = monthBounds(month);
  const [all, events, usage, bookings, maintenance] = await Promise.all([
    allLeads(store),
    store.analytics.countByType(start, end),
    store.aiUsage.getMonth(month),
    store.admin.bookingCount(start, end, excludeDemo),
    store.admin.maintenance(start, end),
  ]);
  const leads = all.filter(
    (l) =>
      +new Date(l.createdAt) >= +start &&
      +new Date(l.createdAt) < +end &&
      (!excludeDemo || !l.isDemo) &&
      !l.isTest,
  );
  const byService: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const lead of leads) {
    byService[lead.serviceSlug] = (byService[lead.serviceSlug] ?? 0) + 1;
    byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
  }
  return {
    month,
    phoneClicks: events.phone_click ?? 0,
    estimateClicks: events.estimate_cta_click ?? 0,
    formStarts: events.form_start ?? 0,
    formRequests: leads.filter((l) => l.source === "contact_form").length,
    aiRequests: leads.filter((l) => l.source === "ai_chat").length,
    byService,
    byStatus,
    notificationFailures: leads.filter((l) =>
      ["failed", "failed_final"].includes(l.notificationStatus),
    ).length,
    aiConversations: usage?.used ?? 0,
    aiAllowance: parsedClientConfig.ai.monthlyConversationAllowance,
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
    costUsd: usage?.costUsd ?? 0,
    bookings,
    maintenance,
  };
}
