import { afterEach, expect, it, vi } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { databaseSsl } from "@/lib/db/pool";
import { assertProductionReady } from "@/lib/config/env";
import template from "@/clients/_template/client.config";
afterEach(() => vi.unstubAllEnvs());
it("refuses memory storage in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(() => new MemoryStore()).toThrow();
});
it("requires a database and flags placeholders", () => {
  const problems = assertProductionReady(template, {});
  expect(problems).toContain("DATABASE_URL is required");
  expect(problems).toContain("Client config contains required placeholders");
});
it("uses verified TLS in production, including with sslmode=disable", () => {
  expect(
    databaseSsl("postgres://user:pass@example.com/db?sslmode=disable", undefined, "production"),
  ).toEqual({ rejectUnauthorized: true });
  expect(databaseSsl("postgres://localhost/db", undefined, "development")).toBe(false);
  expect(databaseSsl("postgres://example.com/db", "certificate", "production")).toEqual({
    rejectUnauthorized: true,
    ca: "certificate",
  });
});
