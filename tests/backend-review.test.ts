import { expect, it } from "vitest";
import { databaseSsl } from "@/lib/db/pool";
import { clientIp } from "@/lib/security/client-ip";
import { clientConfigSchema } from "@/types/client-config";
import { assertProductionReady } from "@/lib/config/env";
import config from "@/clients/demo/client.config";

it("uses plaintext only for loopback regardless of environment", () => {
  expect(databaseSsl("postgres://localhost/db", undefined, "production")).toBe(false);
  expect(databaseSsl("postgres://[::1]/db", undefined, "production")).toBe(false);
  expect(databaseSsl("postgres://remote/db?sslmode=disable", undefined, "development")).toEqual({
    rejectUnauthorized: true,
  });
});
it("prefers trusted proxy headers and shares the unknown bucket", () => {
  expect(
    clientIp(
      new Request("http://localhost", {
        headers: {
          "x-vercel-forwarded-for": "1.1.1.1, 2.2.2.2",
          "x-real-ip": "3.3.3.3",
          "x-forwarded-for": "4.4.4.4",
        },
      }),
    ),
  ).toBe("1.1.1.1");
  expect(clientIp(new Request("http://localhost"))).toBe("unknown");
});
it("validates timezone and notification recipients", () => {
  expect(
    clientConfigSchema.safeParse({
      ...config,
      business: { ...config.business, timezone: "Bad/Zone" },
    }).success,
  ).toBe(false);
  expect(
    clientConfigSchema.safeParse({
      ...config,
      notifications: { ...config.notifications, recipients: [] },
    }).success,
  ).toBe(false);
  expect(
    clientConfigSchema.safeParse({
      ...config,
      notifications: { ...config.notifications, recipients: ["bad"] },
    }).success,
  ).toBe(false);
});
it("rejects demo configuration for production and permits demo without resend", () => {
  expect(
    assertProductionReady(config, { NEXT_PUBLIC_SITE_ENV: "production" }).some((x) =>
      x.includes("mode"),
    ),
  ).toBe(true);
  expect(assertProductionReady(config, {}).some((x) => x.includes("RESEND_API_KEY"))).toBe(false);
});

it("rejects example recipients and URL-shaped production domains", () => {
  const live = {
    ...config,
    mode: "production",
    business: { ...config.business, domain: "https://example.org/path" },
    notifications: {
      ...config.notifications,
      recipients: ["person@example.com", "person@sample.test", "person@sample.invalid"],
    },
  };
  const problems = assertProductionReady(live, { NEXT_PUBLIC_SITE_ENV: "production" });
  expect(problems.some((problem) => problem.includes("domain"))).toBe(true);
  expect(problems.some((problem) => problem.includes("recipients"))).toBe(true);
});
it("uses real IP before forwarded IP", () => {
  expect(
    clientIp(
      new Request("http://localhost", {
        headers: { "x-real-ip": "1.2.3.4", "x-forwarded-for": "4.3.2.1" },
      }),
    ),
  ).toBe("1.2.3.4");
});
