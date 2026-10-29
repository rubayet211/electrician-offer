import { afterEach, expect, it, vi } from "vitest";
import { scryptSync } from "node:crypto";
import { MemoryStore } from "@/lib/store/memory-store";
import { signAdminSession } from "@/lib/security/admin-session";
const store = new MemoryStore();
vi.mock("@/lib/store", () => ({ getStore: () => store }));
import { POST } from "@/app/api/admin/login/route";
import { GET } from "@/app/api/admin/leads/export/route";
afterEach(() => vi.unstubAllEnvs());
it("issues a session for the correct password and limits login attempts", async () => {
  const salt = Buffer.from("sample-salt-1234");
  const hash = scryptSync("password", salt, 64);
  vi.stubEnv(
    "ADMIN_PASSWORD_HASH",
    `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`,
  );
  vi.stubEnv("ADMIN_SESSION_SECRET", "secret");
  const request = () =>
    new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "password=password",
    });
  const first = await POST(request());
  expect(first.status).toBe(303);
  expect(first.headers.get("set-cookie")).toContain("admin_session=");
  for (let i = 0; i < 4; i++) await POST(request());
  expect((await POST(request())).status).toBe(429);
});
it("rejects missing and forged cookies", async () => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", "configured");
  vi.stubEnv("ADMIN_SESSION_SECRET", "secret");
  const req = (cookie: string) =>
    new Request("http://localhost:3000/api/admin/leads/export?month=2026-10", {
      headers: { cookie },
    });
  expect((await GET(req(""))).status).toBe(401);
  expect((await GET(req(`admin_session=${signAdminSession("wrong")}`))).status).toBe(401);
});
