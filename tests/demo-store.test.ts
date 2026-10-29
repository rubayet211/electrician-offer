import { afterEach, expect, it, vi } from "vitest";
import { assertProductionReady } from "@/lib/config/env";
import demo from "@/clients/demo/client.config";
afterEach(() => {
  delete (globalThis as { __electricianStore?: unknown }).__electricianStore;
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.doUnmock("@/config/client.config");
});
it("only permits database-free hosting for mock demo AI", () => {
  expect(assertProductionReady(demo, {}).includes("DATABASE_URL is required")).toBe(false);
  expect(assertProductionReady(demo, { DEMO_AI_LIVE: "true" })).toContain(
    "DATABASE_URL is required",
  );
  expect(assertProductionReady({ ...demo, mode: "production" }, {})).toContain(
    "DATABASE_URL is required",
  );
});
it("runs production demo with memory and refuses live AI after initialization", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("DEMO_AI_LIVE", "false");
  vi.stubEnv("IP_HASH_SECRET", "test");
  vi.stubEnv("AI_SESSION_SECRET", "test");
  vi.stubEnv("CRON_SECRET", "test");
  vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "demo");
  vi.resetModules();
  const { getStore } = await import("@/lib/store");
  const store = getStore();
  expect(store.constructor.name).toBe("MemoryStore");
  expect((await store.rateLimit.hit("test", 1, 1000)).allowed).toBe(true);
  vi.stubEnv("DEMO_AI_LIVE", "true");
  vi.stubEnv("OPENROUTER_API_KEY", "test");
  expect(() => getStore()).toThrow(/DATABASE_URL/);
});
it("rejects a non-demo production memory store", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DEMO_AI_LIVE", "false");
  vi.resetModules();
  vi.doMock("@/config/client.config", () => ({
    parsedClientConfig: { ...demo, mode: "production" },
  }));
  const { MemoryStore } = await import("@/lib/store/memory-store");
  expect(() => new MemoryStore(true)).toThrow(/unavailable/);
});
