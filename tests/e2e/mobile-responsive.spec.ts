import { test, expect } from "./fixtures";

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
];

const VIEWPORTS = [320, 375, 390, 768];

test.describe("Mobile responsiveness and sticky call bar", () => {
  for (const width of VIEWPORTS) {
    test(`no horizontal scroll at ${width}px on key public routes`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });

      for (const route of PUBLIC_ROUTES) {
        await page.goto(route);
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll, `Horizontal scroll detected on ${route} at ${width}px`).toBe(
          false,
        );
      }
    });
  }

  test("header at 320px: tagline hidden, name ≤2 lines, call icon and menu button ≥44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/");

    // Tagline is hidden below 360px
    const tagline = page.locator("header span:has-text('Residential Electrical Services')");
    await expect(tagline).not.toBeVisible();

    // Call icon in header ≥44px
    const callButton = page.locator("header a[aria-label^='Call']:visible");
    await expect(callButton).toBeVisible();
    const callBox = await callButton.boundingBox();
    expect(callBox?.width).toBeGreaterThanOrEqual(44);
    expect(callBox?.height).toBeGreaterThanOrEqual(44);

    // Menu button in header ≥44px
    const menuButton = page.locator("header button[aria-label*='menu' i]");
    await expect(menuButton).toBeVisible();
    const menuBox = await menuButton.boundingBox();
    expect(menuBox?.width).toBeGreaterThanOrEqual(44);
    expect(menuBox?.height).toBeGreaterThanOrEqual(44);

    // Business name wraps to at most 2 lines (check height doesn't exceed 2 lines)
    const nameElement = page.locator("header a[aria-label*='home'] span.font-display");
    await expect(nameElement).toBeVisible();
    const nameLineCount = await nameElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.25;
      return Math.round(el.clientHeight / lineHeight);
    });
    expect(nameLineCount).toBeLessThanOrEqual(2);
  });

  test("sticky bar visibility across breakpoints (<768 visible, ≥768 hidden)", async ({ page }) => {
    const stickyBar = page.locator("aside[aria-label='Quick contact actions']");

    // Check visible at 320, 375, 390
    for (const width of [320, 375, 390]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/");
      await expect(stickyBar).toBeVisible();
    }

    // Check hidden at 768 and 1440
    for (const width of [768, 1440]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/");
      await expect(stickyBar).not.toBeVisible();
    }
  });

  test("sticky bar interactive targets are ≥44px (and ≥48px tall) with safe-area padding preserved", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const stickyBar = page.locator("aside[aria-label='Quick contact actions']");
    await expect(stickyBar).toBeVisible();

    // Check Call target
    const callTarget = stickyBar.locator("a[aria-label^='Call']");
    await expect(callTarget).toBeVisible();
    const callBox = await callTarget.boundingBox();
    expect(callBox?.width).toBeGreaterThanOrEqual(44);
    expect(callBox?.height).toBeGreaterThanOrEqual(48);

    // Check Estimate target
    const estimateTarget = stickyBar.locator("a[href='/contact']");
    await expect(estimateTarget).toBeVisible();
    const estimateBox = await estimateTarget.boundingBox();
    expect(estimateBox?.width).toBeGreaterThanOrEqual(44);
    expect(estimateBox?.height).toBeGreaterThanOrEqual(48);

    // Check Ask target
    const askTarget = stickyBar.locator(
      "button[aria-label='Ask a question with the AI assistant']",
    );
    await expect(askTarget).toBeVisible();
    const askBox = await askTarget.boundingBox();
    expect(askBox?.width).toBeGreaterThanOrEqual(44);
    expect(askBox?.height).toBeGreaterThanOrEqual(48);

    // Verify safe-area padding style is preserved on container
    const asideClassName = await stickyBar.getAttribute("class");
    expect(asideClassName).toContain("pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]");
  });

  test("sticky bar does not cover the form submit button when scrolled into view", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/contact?service=panel-upgrades");

    // Advance to Step 2
    await page.locator("button:has-text('Continue to details')").click();
    await page.locator("#panel-reason").selectOption("adding_load");
    await page.locator("#panel-property").selectOption("single_family");
    await page.locator("#description").fill("Service upgrade from 100A to 200A.");
    await page.locator("button:has-text('Continue to contact')").click();

    // In Step 3: locate submit button and scroll into view
    const submitBtn = page.locator("button:has-text('Send estimate request')");
    await submitBtn.scrollIntoViewIfNeeded();

    const submitBox = await submitBtn.boundingBox();
    const stickyBar = page.locator("aside[aria-label='Quick contact actions']");
    const stickyBox = await stickyBar.boundingBox();

    expect(submitBox).not.toBeNull();
    expect(stickyBox).not.toBeNull();

    // The bottom of the submit button must be above the top of the sticky bar
    if (submitBox && stickyBox) {
      expect(submitBox.y + submitBox.height).toBeLessThanOrEqual(stickyBox.y);
    }
  });
});
