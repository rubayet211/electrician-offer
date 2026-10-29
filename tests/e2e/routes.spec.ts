import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/services",
  "/service-areas",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/services/repair-troubleshooting",
  "/services/panel-upgrades",
  "/services/ev-charger-installation",
  "/services/lighting-installation",
  "/services/generator-installation",
  "/services/outlets-switches",
  "/services/surge-protection",
  "/services/electrical-inspections",
];

test.describe("Public routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`route ${route} returns 200, has one h1, title, meta description, and working skip link`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      // Exactly one <h1>
      const h1Elements = page.locator("h1");
      await expect(h1Elements).toHaveCount(1);

      // Has a non-empty <title>
      const title = await page.title();
      expect(title.trim().length).toBeGreaterThan(0);

      // Has a non-empty meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute("content", /.+/);

      // Skip link moves focus to main
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeAttached();
      await skipLink.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
    });
  }
});
