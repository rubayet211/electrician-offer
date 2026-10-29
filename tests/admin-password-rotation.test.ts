import { afterEach, expect, it, vi } from "vitest";
import {
  adminPasswordHash,
  signAdminSession,
  verifyAdminSession,
} from "@/lib/security/admin-session";
afterEach(() => vi.unstubAllEnvs());
it("decodes base64 password hashes and invalidates sessions after rotation", () => {
  vi.stubEnv("ADMIN_PASSWORD_HASH_B64", Buffer.from("scrypt$first$hash").toString("base64"));
  expect(adminPasswordHash()).toBe("scrypt$first$hash");
  const token = signAdminSession("secret", 1000);
  expect(verifyAdminSession(token, "secret", 1001)).toBe(true);
  vi.stubEnv("ADMIN_PASSWORD_HASH_B64", Buffer.from("scrypt$second$hash").toString("base64"));
  expect(verifyAdminSession(token, "secret", 1001)).toBe(false);
});
