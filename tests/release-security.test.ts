import { afterEach, expect, it, vi } from "vitest";
import { parsedClientConfig as config } from "@/config/client.config";
import { buildRobots } from "@/app/robots";
import { buildSitemap } from "@/app/sitemap";
import { buildMetadata } from "@/lib/seo/metadata";
import { validateStaticConfig } from "@/scripts/lib/prelaunch.mjs";
import { clientIp } from "@/lib/security/client-ip";
import nextConfig from "@/next.config";

afterEach(() => vi.unstubAllEnvs());
it("requires production environment consistently for indexing", () => {
  const prod = { ...config, mode: "production" as const };
  vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "");
  expect(buildRobots(prod).rules).toEqual({ userAgent: "*", disallow: "/" });
  expect(buildSitemap(prod)).toEqual([]);
  expect(buildMetadata({ title: "T", description: "D", path: "/" }, prod).robots).toEqual({
    index: false,
    follow: false,
  });
  expect(validateStaticConfig(prod, {}).problems).toContain(
    "NEXT_PUBLIC_SITE_ENV must be production",
  );
});
it("sets security headers on all routes and HSTS only in production", async () => {
  for (const env of ["production", "development"]) {
    vi.stubEnv("NODE_ENV", env);
    const [route] = await nextConfig.headers!();
    expect(route.source).toBe("/:path*");
    const headers = Object.fromEntries(route.headers.map(({ key, value }) => [key, value]));
    expect(headers).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'",
    });
    expect(headers["Strict-Transport-Security"]).toBe(
      env === "production" ? "max-age=63072000; includeSubDomains" : undefined,
    );
  }
});
it("ignores untrusted IP headers in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  const headers = { "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" };
  expect(clientIp(new Request("https://example.com", { headers }))).toBe("unknown");
  expect(
    clientIp(
      new Request("https://example.com", {
        headers: { ...headers, "x-vercel-forwarded-for": "9.8.7.6" },
      }),
    ),
  ).toBe("9.8.7.6");
});
