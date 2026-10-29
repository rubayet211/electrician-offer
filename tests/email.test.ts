import { afterEach, expect, it, vi } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { retryPendingNotifications, sendLeadNotificationEmail } from "@/lib/notifications/email";
import { submitInquiry } from "@/lib/inquiries/service";
vi.mock("@/config/client.config", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/config/client.config")>();
  return {
    ...original,
    parsedClientConfig: { ...original.parsedClientConfig, mode: "production" },
  };
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
const raw = {
  name: "<img src=x>",
  phone: "5550100142",
  zip: "12345",
  serviceSlug: "outlets-switches",
  description: "Please check <script>alert(1)</script>",
  urgency: "routine",
  consent: true,
  idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
  formStartedAt: Date.now() - 5000,
  details: { formType: "general" },
};
it("retains a lead after email failure without claiming delivery", async () => {
  vi.stubEnv("RESEND_API_KEY", "test");
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("error", { status: 500 }));
  const store = new MemoryStore();
  const result = await submitInquiry(raw, { ipHash: "hash", source: "contact_form", store });
  expect(result).toMatchObject({ ok: true, status: 201, notification: "queued" });
  const lead = await store.leads.findByIdempotencyKey(raw.idempotencyKey);
  expect(lead).toMatchObject({
    notificationStatus: "failed",
    notificationAttempts: 1,
    notificationLastError: "ProviderHttp500",
  });
});
it("escapes user content in HTML and sends an idempotency key", async () => {
  vi.stubEnv("RESEND_API_KEY", "test");
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(Response.json({ id: "provider" }));
  const store = new MemoryStore();
  await submitInquiry(raw, { ipHash: "hash", source: "contact_form", store });
  const lead = (await store.leads.findByIdempotencyKey(raw.idempotencyKey))!;
  await sendLeadNotificationEmail(lead);
  const options = fetchSpy.mock.calls[0][1]!;
  const body = JSON.parse(String(options.body));
  expect(body.html).toContain("&lt;script&gt;");
  expect(body.html).not.toContain("<script>");
  expect((options.headers as Record<string, string>)["Idempotency-Key"]).toBe(lead.id);
});

it("retries eligible failures and stops after five attempts", async () => {
  vi.stubEnv("RESEND_API_KEY", "test");
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("error", { status: 500 }));
  const store = new MemoryStore();
  const lead = {
    ...raw,
    id: "lead",
    reference: "EL-123456",
    createdAt: new Date().toISOString(),
    phone: "+15550100142",
    details: { formType: "general" as const },
    urgency: "routine" as const,
    consent: true as const,
    source: "contact_form" as const,
    ipHash: "hash",
    isDemo: false,
    status: "new",
    notificationStatus: "failed" as const,
    notificationAttempts: 4,
    notificationLastAttemptAt: new Date(Date.now() - 3600001).toISOString(),
    dedupeHash: "hash",
    photoCount: 0,
  };
  await store.leads.create(lead, []);
  expect(await retryPendingNotifications(10, store)).toBe(1);
  expect((await store.leads.get("lead"))?.notificationAttempts).toBe(5);
  expect(await retryPendingNotifications(10, store)).toBe(0);
  expect(fetchSpy).toHaveBeenCalledTimes(1);
});
