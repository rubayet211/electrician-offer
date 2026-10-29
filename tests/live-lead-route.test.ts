import { afterEach, expect, it, vi } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
vi.mock("@/config/client.config", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/config/client.config")>();
  return {
    ...original,
    parsedClientConfig: { ...original.parsedClientConfig, mode: "production" },
  };
});
const store = new MemoryStore();
vi.mock("@/lib/store", () => ({ getStore: () => store }));
import { POST } from "@/app/api/leads/route";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
function form(key: string) {
  const data = new FormData();
  const fields = {
    name: "Alex",
    phone: "5550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
    consent: "true",
    idempotencyKey: key,
    formStartedAt: String(Date.now() - 5000),
    details: JSON.stringify({
      formType: "panel",
      reason: "adding_load",
      propertyType: "single_family",
    }),
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  data.set(
    "photos",
    new File([new Uint8Array([255, 216, 255])], "photo.jpg", { type: "image/jpeg" }),
  );
  return data;
}
it("saves multipart photos and sends a live notification through the route", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");
  vi.stubEnv("RESEND_API_KEY", "key");
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "provider" }));
  const key = "2fe705c5-8cf6-4f08-8e0b-71ad73c166de";
  const response = await POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { origin: "http://localhost", "x-real-ip": "198.51.100.100" },
      body: form(key),
    }),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({ ok: true, notification: "queued" });
  expect(await store.leads.findByIdempotencyKey(key)).toMatchObject({
    photoCount: 1,
    notificationStatus: "sent",
    notificationAttempts: 1,
  });
  expect(fetch).toHaveBeenCalledOnce();
});
it("returns 201 when notification claim throws after save", async () => {
  vi.spyOn(store.leads, "claimNotification").mockRejectedValue(new Error("failure"));
  const data = form("6821288e-a4ba-405c-9c01-83f38732acb9");
  data.set("description", "Different electrical work");
  const response = await POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { origin: "http://localhost", "x-real-ip": "198.51.100.101" },
      body: data,
    }),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({ ok: true, notification: "queued" });
});
