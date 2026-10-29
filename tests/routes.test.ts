import { afterEach, expect, it, vi } from "vitest";
import { GET as notifications } from "@/app/api/cron/notifications/route";
import { GET as retention } from "@/app/api/cron/retention/route";
import { POST as leads } from "@/app/api/leads/route";
afterEach(() => vi.unstubAllEnvs());
it.each([notifications, retention])("requires cron authorization", async (handler) => {
  vi.stubEnv("CRON_SECRET", "test-secret");
  expect((await handler(new Request("http://localhost"))).status).toBe(401);
  expect(
    (
      await handler(
        new Request("http://localhost", { headers: { authorization: "Bearer test-secret" } }),
      )
    ).status,
  ).toBe(200);
});
it("checks origin and bounds the request body", async () => {
  expect(
    (
      await leads(
        new Request("http://localhost/api/leads", {
          method: "POST",
          headers: { origin: "https://evil.example" },
        }),
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await leads(
        new Request("http://localhost/api/leads", {
          method: "POST",
          headers: { origin: "http://localhost", "content-length": String(16 * 1024 * 1024) },
        }),
      )
    ).status,
  ).toBe(413);
});
it("accepts multipart JSON details", async () => {
  const f = new FormData();
  const fields = {
    name: "Alex",
    phone: "5550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
    consent: "true",
    idempotencyKey: "b833a9ee-375b-489a-a813-51a90ff49a2c",
    formStartedAt: String(Date.now() - 5000),
    details: JSON.stringify({
      formType: "panel",
      reason: "adding_load",
      propertyType: "single_family",
    }),
  };
  for (const [key, value] of Object.entries(fields)) f.set(key, value);
  const response = await leads(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { origin: "http://localhost" },
      body: f,
    }),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({ ok: true, notification: "demo" });
});
