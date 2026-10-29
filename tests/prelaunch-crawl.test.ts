import { afterEach, expect, it, vi } from "vitest";
import { crawlAndValidateUrl } from "@/scripts/lib/prelaunch.mjs";
afterEach(() => vi.unstubAllGlobals());
const page = (path: string, noindex = false) =>
  `<title>${path}</title><meta name="description" content="desc"><link rel="canonical" href="https://real.example${path}"><h1>Heading</h1><a href="tel:123">Call</a><script type="application/ld+json">{}</script>${noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}`;
it("crawls configured staging pages and requires noindex and disallow", async () => {
  const fetchMock = vi.fn(
    async (url: string) =>
      new Response(
        url.endsWith("robots.txt")
          ? "User-agent: *\nDisallow: /"
          : page(new URL(url).pathname, true),
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  const result = await crawlAndValidateUrl("https://stage.example", {
    expectNoindex: true,
    config: {
      pages: [{ slug: "about", enabled: true }],
      services: [{ slug: "panel", offered: true }],
    },
  });
  expect(result.passed).toBe(true);
  expect(result.results.map((r: { url: string }) => r.url)).toEqual([
    "https://stage.example/",
    "https://stage.example/about",
    "https://stage.example/services/panel",
  ]);
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(url.endsWith("robots.txt") ? "Allow: /" : page(new URL(url).pathname)),
    ),
  );
  expect((await crawlAndValidateUrl("https://stage.example", { expectNoindex: true })).passed).toBe(
    false,
  );
});
it("rewrites sitemap hosts to the requested host", async () => {
  const fetchMock = vi.fn(
    async (url: string) =>
      new Response(
        url.endsWith("robots.txt")
          ? "Allow: /"
          : url.endsWith("sitemap.xml")
            ? "<loc>https://real.example/about</loc>"
            : page(new URL(url).pathname),
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  const result = await crawlAndValidateUrl("https://stage.example");
  expect(result.passed).toBe(true);
  expect(fetchMock).toHaveBeenCalledWith("https://stage.example/about");
});
