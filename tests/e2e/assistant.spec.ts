import { test, expect } from "./fixtures";

test.describe("AI Assistant", () => {
  test("GET /api/ai-chat returns available or a documented reason in demo mode", async ({
    page,
  }) => {
    const response = await page.request.get("/api/ai-chat");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("available");
    expect(typeof data.available).toBe("boolean");

    if (!data.available) {
      expect(typeof data.reason).toBe("string");
      expect(data.reason.length).toBeGreaterThan(0);
    }

    expect(data.isDemo).toBe(true);
    expect(data.displayName).toBe("Demo assistant");
  });

  test("clicking Ask in the sticky bar opens the assistant dialog", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const askButton = page.locator(
      "aside[aria-label='Quick contact actions'] button[aria-label='Ask a question with the AI assistant']",
    );
    await expect(askButton).toBeVisible();

    // Click Ask button in sticky call bar
    await askButton.click();

    // Check if dialog opened
    const dialog = page.locator("[role='dialog'][aria-modal='true']");
    await expect(dialog).toBeVisible();
    await expect(page.locator("#assistant-title")).toBeVisible();
  });
});
