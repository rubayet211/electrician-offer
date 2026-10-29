import { afterEach, expect, it, vi } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { parsedClientConfig } from "@/config/client.config";
import { submitInquiry } from "@/lib/inquiries/service";
import { monthlyReport } from "@/lib/reporting/monthly";
vi.mock("@/config/client.config", async (original) => {
  const originalModule = await original<typeof import("@/config/client.config")>();
  return {
    ...originalModule,
    parsedClientConfig: {
      ...originalModule.parsedClientConfig,
      mode: "production",
      notifications: { ...originalModule.parsedClientConfig.notifications },
    },
  };
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  delete parsedClientConfig.notifications.stagingRecipients;
});
const input = {
  name: "Alex",
  phone: "5550100142",
  zip: "12345",
  serviceSlug: "outlets-switches",
  description: "Please check the outlets",
  urgency: "routine",
  consent: true,
  idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
  formStartedAt: Date.now() - 5000,
  details: { formType: "general" },
};
it("marks staging leads and skips email without staging recipients", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "staging");
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  const store = new MemoryStore();
  await submitInquiry(input, { ipHash: "hash", source: "contact_form", store });
  const lead = (await store.leads.findByIdempotencyKey(input.idempotencyKey))!;
  expect(lead).toMatchObject({ isDemo: false, isTest: true, notificationStatus: "skipped_test" });
  expect(fetchSpy).not.toHaveBeenCalled();
  expect((await monthlyReport(lead.createdAt.slice(0, 7), store)).formRequests).toBe(0);
});
it("sends staging leads only to configured staging recipients", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "staging");
  vi.stubEnv("RESEND_API_KEY", "key");
  parsedClientConfig.notifications.stagingRecipients = ["staging@company.com"];
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "sent" }));
  const store = new MemoryStore();
  await submitInquiry(input, { ipHash: "hash", source: "contact_form", store });
  expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body)).to).toEqual(["staging@company.com"]);
  expect((await store.leads.findByIdempotencyKey(input.idempotencyKey))?.notificationStatus).toBe(
    "sent",
  );
});
