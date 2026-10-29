import { describe, expect, it } from "vitest";
import { scryptSync } from "node:crypto";
import {
  signAdminSession,
  verifyAdminSession,
  verifyAdminPassword,
} from "@/lib/security/admin-session";

describe("admin authentication", () => {
  it("verifies passwords and rejects forged and expired sessions", async () => {
    const salt = Buffer.from("sample-salt-1234");
    const hash = scryptSync("correct", salt, 64, { N: 16384, r: 8, p: 1 });
    const encoded = `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
    expect(await verifyAdminPassword("correct", encoded)).toBe(true);
    expect(await verifyAdminPassword("wrong", encoded)).toBe(false);
    const token = signAdminSession("secret", 1000);
    expect(verifyAdminSession(token, "secret", 1001)).toBe(true);
    expect(verifyAdminSession(token + "x", "secret", 1001)).toBe(false);
    expect(verifyAdminSession(token, "secret", 1000 + 8 * 60 * 60 * 1000)).toBe(false);
  });
});
