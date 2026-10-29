import { expect, it } from "vitest";
import { isAllowedOrigin } from "@/lib/security/origin";
import { hashIp } from "@/lib/security/hash";
it("rejects foreign origins", () => {
  expect(
    isAllowedOrigin(
      new Request("http://localhost/api", { headers: { origin: "https://evil.example" } }),
    ),
  ).toBe(false);
  expect(
    isAllowedOrigin(
      new Request("http://localhost/api", {
        headers: { origin: "https://electrician-demo.axinofy.com" },
      }),
    ),
  ).toBe(true);
});
it("hashes addresses deterministically", () => {
  expect(hashIp("192.0.2.1")).toBe(hashIp("192.0.2.1"));
  expect(hashIp("192.0.2.1")).not.toContain("192.0.2.1");
});
