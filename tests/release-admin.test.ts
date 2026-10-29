import { afterEach, expect, it, vi } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { parsedClientConfig } from "@/config/client.config";
import { signAdminSession } from "@/lib/security/admin-session";
const store = new MemoryStore();
vi.mock("@/lib/store", () => ({ getStore: () => store }));
import { GET } from "@/app/api/admin/leads/export/route";
import { POST } from "@/app/api/admin/leads/[id]/retry/route";
const mode = parsedClientConfig.mode;
afterEach(() => {
  parsedClientConfig.mode = mode;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it("exports production leads without demo or test leads and preserves phone numbers", async () => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", "hash");
  vi.stubEnv("ADMIN_SESSION_SECRET", "secret");
  parsedClientConfig.mode = "production";
  const base = {
    createdAt: "2026-10-15T12:00:00Z",
    name: "Alex",
    phone: "+15550100142",
    serviceSlug: "general",
    description: "Need work",
    urgency: "routine" as const,
    consent: true as const,
    details: { formType: "general" as const },
    source: "contact_form" as const,
    ipHash: "x",
    status: "new",
    notificationStatus: "pending" as const,
    notificationAttempts: 0,
    photoCount: 0,
  };
  for (const [id, isDemo, isTest] of [
    ["live", false, false],
    ["demo", true, false],
    ["test", false, true],
  ] as const)
    await store.leads.create(
      { ...base, id, reference: id, idempotencyKey: id, dedupeHash: id, isDemo, isTest },
      [],
    );
  const req = new Request("http://localhost/api/admin/leads/export?month=2026-10", {
    headers: { cookie: `admin_session=${signAdminSession("secret")}` },
  });
  const text = await (await GET(req)).text();
  expect(text).toContain('"live"');
  expect(text).toContain('"+15550100142"');
  expect(text).not.toContain('"demo"');
  expect(text).not.toContain('"test"');
});
it("manual retry returns visible result and refuses demo leads", async () => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", "hash");
  vi.stubEnv("ADMIN_SESSION_SECRET", "secret");
  vi.stubEnv("RESEND_API_KEY", "key");
  const request = () =>
    new Request("http://localhost/api/admin/leads/live/retry", {
      method: "POST",
      headers: {
        origin: "http://localhost",
        cookie: `admin_session=${signAdminSession("secret")}`,
      },
    });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "provider" }));
  const result = await POST(request(), { params: Promise.resolve({ id: "live" }) });
  expect(result.headers.get("location")).toContain("retry=sent");
  const test = await POST(request(), { params: Promise.resolve({ id: "test" }) });
  expect(test.headers.get("location")).toContain("retry=skipped");
  expect((await store.leads.get("test"))?.notificationStatus).toBe("skipped_test");
  const demo = await POST(request(), { params: Promise.resolve({ id: "demo" }) });
  expect(demo.headers.get("location")).toContain("retry=unavailable");
});
