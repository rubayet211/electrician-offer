import { expect, it } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { monthlyReport } from "@/lib/reporting/monthly";
it("separates clicks, requests and bookings and excludes demo leads", async () => {
  const store = new MemoryStore();
  await store.analytics.record({
    id: "a",
    type: "phone_click",
    page: "/",
    createdAt: "2026-10-01T00:00:00Z",
  });
  const base = {
    createdAt: "2026-10-01T00:00:00Z",
    name: "A",
    phone: "1234567890",
    serviceSlug: "general",
    description: "description",
    urgency: "routine",
    consent: true,
    source: "contact_form",
    ipHash: "x",
    status: "new",
    notificationStatus: "pending",
    notificationAttempts: 0,
    photoCount: 0,
    details: { formType: "general" },
  } as const;
  await store.leads.create(
    { ...base, id: "1", reference: "EL-1", idempotencyKey: "a", dedupeHash: "a", isDemo: false },
    [],
  );
  await store.leads.create(
    { ...base, id: "2", reference: "EL-2", idempotencyKey: "b", dedupeHash: "b", isDemo: true },
    [],
  );
  const report = await monthlyReport("2026-10", store, true);
  expect(report.phoneClicks).toBe(1);
  expect(report.formRequests).toBe(1);
  expect(report.bookings).toBe(0);
});
