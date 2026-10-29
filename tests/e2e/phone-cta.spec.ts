import { test, expect } from "@playwright/test";

const CONFIGURED_PHONE = "+15550100142";

test.describe("Phone CTA", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept analytics event to avoid navigation/network dropouts and fulfill successfully
    await page.route("**/api/analytics/event", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
  });

  test("header call link has configured E.164 tel: and fires phone_click analytics without PII", async ({
    page,
  }) => {
    await page.goto("/");

    // Locate visible header call link
    const headerCallLink = page.locator("header a[href^='tel:']:visible").first();
    await expect(headerCallLink).toBeAttached();
    await expect(headerCallLink).toHaveAttribute("href", `tel:${CONFIGURED_PHONE}`);

    // Click and capture analytics request
    const requestPromise = page.waitForRequest((req) => {
      return req.url().includes("/api/analytics/event") && req.method() === "POST";
    });

    await headerCallLink.click({ force: true });
    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.type).toBe("phone_click");
    expect(postData.name).toBeUndefined();
    expect(postData.phone).toBeUndefined();
    expect(postData.email).toBeUndefined();

    // Verify raw post data string does not contain PII keys
    const rawBody = request.postData() || "";
    expect(rawBody).not.toMatch(/"name"\s*:/i);
    expect(rawBody).not.toMatch(/"phone"\s*:/i);
    expect(rawBody).not.toMatch(/"email"\s*:/i);
  });

  test("hero call link has configured E.164 tel: and fires phone_click analytics without PII", async ({
    page,
  }) => {
    await page.goto("/");

    // Locate hero call link inside main
    const heroCallLink = page.locator("main a[href^='tel:']").first();
    await expect(heroCallLink).toBeAttached();
    await expect(heroCallLink).toHaveAttribute("href", `tel:${CONFIGURED_PHONE}`);

    const requestPromise = page.waitForRequest((req) => {
      return req.url().includes("/api/analytics/event") && req.method() === "POST";
    });

    await heroCallLink.click({ force: true });
    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.type).toBe("phone_click");
    expect(postData.name).toBeUndefined();
    expect(postData.phone).toBeUndefined();
    expect(postData.email).toBeUndefined();

    const rawBody = request.postData() || "";
    expect(rawBody).not.toMatch(/"name"\s*:/i);
    expect(rawBody).not.toMatch(/"phone"\s*:/i);
    expect(rawBody).not.toMatch(/"email"\s*:/i);
  });

  test("sticky bar call link has configured E.164 tel: and fires phone_click analytics without PII on mobile", async ({
    page,
  }) => {
    // Ensure mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const stickyCallLink = page.locator(
      "aside[aria-label='Quick contact actions'] a[href^='tel:']",
    );
    await expect(stickyCallLink).toBeVisible();
    await expect(stickyCallLink).toHaveAttribute("href", `tel:${CONFIGURED_PHONE}`);

    const requestPromise = page.waitForRequest((req) => {
      return req.url().includes("/api/analytics/event") && req.method() === "POST";
    });

    await stickyCallLink.click({ force: true });
    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.type).toBe("phone_click");
    expect(postData.name).toBeUndefined();
    expect(postData.phone).toBeUndefined();
    expect(postData.email).toBeUndefined();

    const rawBody = request.postData() || "";
    expect(rawBody).not.toMatch(/"name"\s*:/i);
    expect(rawBody).not.toMatch(/"phone"\s*:/i);
    expect(rawBody).not.toMatch(/"email"\s*:/i);
  });
});
