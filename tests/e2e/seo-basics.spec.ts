import { test, expect } from "./fixtures";

test.describe("SEO basics in demo mode", () => {
  test("robots.txt in demo mode disallows all", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    const text = await response!.text();
    expect(text).toMatch(/Disallow:\s*\//);
  });

  test("pages have noindex meta in demo mode", async ({ page }) => {
    await page.goto("/");

    const robotsMeta = page.locator("meta[name='robots']");
    const count = await robotsMeta.count();
    expect(count).toBeGreaterThan(0);

    const content = await robotsMeta.getAttribute("content");
    expect(content).toContain("noindex");
  });
});
