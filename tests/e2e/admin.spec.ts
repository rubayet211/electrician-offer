import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.locator("#password").fill("e2e-admin-password-123");
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
  await expect(page.locator("h1:has-text('Leads')")).toBeVisible();
}

test.describe("Admin portal", () => {
  test.beforeEach(async ({ isMobile }, testInfo) => {
    // Run tests (a)-(j) on desktop only; mobile layout smoke runs on mobile
    if (isMobile && !testInfo.title.includes("mobile layout smoke")) {
      test.skip(true, "Desktop only");
    }
  });

  test("(a) /admin redirects to /admin/login without session; /api/admin/* returns 401", async ({
    page,
  }) => {
    // 1. /admin redirects without session
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    // 2. /api/admin/* endpoints return 401
    const exportRes = await page.request.get("/api/admin/leads/export?month=2026-10");
    expect(exportRes.status()).toBe(401);

    const updateRes = await page.request.post("/api/admin/leads/non-existent-id", {
      headers: {
        Origin: "http://localhost:3300",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "status=contacted&note=test",
    });
    expect(updateRes.status()).toBe(401);

    const maintenanceRes = await page.request.post("/api/admin/maintenance", {
      headers: {
        Origin: "http://localhost:3300",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "date=2026-10-01&minutes=15&description=test",
    });
    expect(maintenanceRes.status()).toBe(401);
  });

  test("(b) wrong password shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#password").fill("incorrect-password-test");
    await page.locator("button[type='submit']").click();

    // Verify error is visible
    await expect(page.locator("[role='alert']")).toBeVisible();
    expect(page.url()).toContain("/admin/login");
  });

  test("(c) correct password → leads list", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#password").fill("e2e-admin-password-123");
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
    await expect(page.locator("h1:has-text('Leads')")).toBeVisible();
  });

  test("(d) submit a demo estimate through /contact first, then it appears in the list with reference, service, source contact_form, notification badge 'skipped_demo'/demo", async ({
    page,
  }) => {
    const testId = Math.random().toString(36).slice(2, 8);

    // 1. Submit through /contact
    await page.goto("/contact?service=panel-upgrades");
    await page.locator("button:has-text('Continue to details')").click();
    await page.locator("#panel-reason").selectOption("adding_load");
    await page.locator("#panel-property").selectOption("single_family");
    await page
      .locator("#description")
      .fill(`Panel upgrade project for E2E verification [${testId}].`);
    await page.locator("button:has-text('Continue to contact')").click();

    await page.locator("#contact-name").fill(`Jordan Test ${testId}`);
    await page.locator("#contact-phone").fill("5550100144");
    await page.locator("#contact-email").fill(`jordan.${testId}@example.com`);
    await page.locator("#contact-zip").fill("90210");
    await page.locator("#consent").check();

    await page.waitForTimeout(3300);
    const submitButton = page.locator("button:has-text('Send estimate request')");
    await submitButton.dblclick();

    const confirmationPanel = page.locator("[role='status'][aria-live='polite']");
    await expect(confirmationPanel).toBeVisible({ timeout: 20000 });
    const referenceElement = page.locator(".font-mono.text-base.font-bold.text-ink");
    await expect(referenceElement).toBeVisible();
    const reference = ((await referenceElement.textContent()) || "").trim();
    expect(reference).toMatch(/^EL-[0-9A-Z]{6}$/);

    // 2. Log in and verify in the leads list
    await loginAsAdmin(page);

    const leadRow = page
      .locator(`tr:has-text('${reference}'), div:has-text('${reference}')`)
      .first();
    await expect(leadRow).toBeVisible();

    await expect(leadRow.locator(`text=${reference}`)).toBeVisible();
    await expect(leadRow.locator("text=panel-upgrades")).toBeVisible();
    await expect(leadRow.locator("text=contact_form")).toBeVisible();
    await expect(
      leadRow.locator("text=skipped_demo").or(leadRow.locator("text=demo")),
    ).toBeVisible();
  });

  test("(e) filter by service and by status", async ({ page }) => {
    const testId = Math.random().toString(36).slice(2, 8);

    // Submit an EV charger request
    await page.goto("/contact?service=ev-charger-installation");
    await page.locator("button:has-text('Continue to details')").click();
    await page.locator("#ev-property").selectOption("residential");
    await page.locator("#ev-owns-charger").selectOption("yes");
    await page.locator("#ev-install-location").selectOption("garage");
    await page
      .locator("#description")
      .fill(`Installing Level 2 EV charger in residential garage [${testId}].`);
    await page.locator("button:has-text('Continue to contact')").click();
    await page.locator("#contact-name").fill(`EV Customer ${testId}`);
    await page.locator("#contact-phone").fill("5550100155");
    await page.locator("#contact-zip").fill("90210");
    await page.locator("#consent").check();
    await page.waitForTimeout(3300);
    const submitButton = page.locator("button:has-text('Send estimate request')");
    await submitButton.dblclick();

    const confirmationPanel = page.locator("[role='status'][aria-live='polite']");
    await expect(confirmationPanel).toBeVisible({ timeout: 20000 });
    const evRef = (
      (await page.locator(".font-mono.text-base.font-bold.text-ink").textContent()) || ""
    ).trim();

    await loginAsAdmin(page);

    // Filter by EV charger service
    await page.locator("#filter-service").selectOption("ev-charger-installation");
    await page.locator("button:has-text('Filter')").click();
    await expect(page.locator(`text=${evRef}`)).toBeVisible();

    // Filter by another service (generator-installation)
    await page.locator("#filter-service").selectOption("generator-installation");
    await page.locator("button:has-text('Filter')").click();
    await expect(page.locator(`text=${evRef}`)).not.toBeVisible();

    // Filter by status = new
    await page.locator("#filter-service").selectOption("");
    await page.locator("#filter-status").selectOption("new");
    await page.locator("button:has-text('Filter')").click();
    await expect(page.locator(`text=${evRef}`)).toBeVisible();

    // Filter by status = closed (should not show new lead)
    await page.locator("#filter-status").selectOption("closed");
    await page.locator("button:has-text('Filter')").click();
    await expect(page.locator(`text=${evRef}`)).not.toBeVisible();
  });

  test("(f) open detail: labeled service details visible; change status New → Contacted with a note; event history shows it; reload persists", async ({
    page,
  }) => {
    const testId = Math.random().toString(36).slice(2, 8);

    await page.goto("/contact?service=panel-upgrades");
    await page.locator("button:has-text('Continue to details')").click();
    await page.locator("#panel-reason").selectOption("adding_load");
    await page.locator("#panel-property").selectOption("single_family");
    await page.locator("#description").fill(`Panel capacity upgrade detail test [${testId}].`);
    await page.locator("button:has-text('Continue to contact')").click();
    await page.locator("#contact-name").fill(`Sam Taylor ${testId}`);
    await page.locator("#contact-phone").fill("5550100166");
    await page.locator("#contact-zip").fill("90210");
    await page.locator("#consent").check();
    await page.waitForTimeout(3300);
    const submitButton = page.locator("button:has-text('Send estimate request')");
    await submitButton.dblclick();

    await expect(page.locator("[role='status'][aria-live='polite']")).toBeVisible({
      timeout: 20000,
    });
    const ref = (
      (await page.locator(".font-mono.text-base.font-bold.text-ink").textContent()) || ""
    ).trim();

    await loginAsAdmin(page);

    // Open detail
    await page.locator(`a:has-text('${ref}')`).first().click();
    await expect(page).toHaveURL(/\/admin\/leads\/.+/);
    await expect(page.locator(`h1:has-text('${ref}')`)).toBeVisible();

    // Labeled service details visible
    await expect(page.locator("text=Service Details")).toBeVisible();
    await expect(page.locator("text=Reason")).toBeVisible();
    await expect(
      page.locator("text=Adding load").or(page.locator("text=adding_load")),
    ).toBeVisible();
    await expect(page.locator("text=Property type")).toBeVisible();
    await expect(
      page.locator("text=Single family").or(page.locator("text=single_family")),
    ).toBeVisible();

    // Change status New → Contacted with note
    const noteContent = `Called customer to discuss panel upgrade scope [${testId}].`;
    await page.locator("#status").selectOption("contacted");
    await page.locator("#note").fill(noteContent);
    await page.locator("button:has-text('Save')").click();

    // Wait for update
    await expect(page).toHaveURL(/\/admin\/leads\/.+/);

    // Event history shows it
    await expect(page.locator("text=Event History")).toBeVisible();
    await expect(page.locator("text=contacted").first()).toBeVisible();
    await expect(page.locator(`text=${noteContent}`)).toBeVisible();

    // Reload persists
    await page.reload();
    await expect(page.locator("#status")).toHaveValue("contacted");
    await expect(page.locator(`text=${noteContent}`)).toBeVisible();
  });

  test("(g) CSV export downloads with header row and the reference; a lead whose name starts with '=' is exported with a leading apostrophe", async ({
    page,
  }) => {
    const testId = Math.random().toString(36).slice(2, 8);
    const formulaName = `=SUM(1,2) ${testId}`;

    await page.goto("/contact?service=panel-upgrades");
    await page.locator("button:has-text('Continue to details')").click();
    await page.locator("#panel-reason").selectOption("adding_load");
    await page.locator("#panel-property").selectOption("single_family");
    await page
      .locator("#description")
      .fill(`Testing formula injection export protection [${testId}].`);
    await page.locator("button:has-text('Continue to contact')").click();
    await page.locator("#contact-name").fill(formulaName);
    await page.locator("#contact-phone").fill("5550100177");
    await page.locator("#contact-zip").fill("90210");
    await page.locator("#consent").check();
    await page.waitForTimeout(3300);
    const submitButton = page.locator("button:has-text('Send estimate request')");
    await submitButton.dblclick();

    await expect(page.locator("[role='status'][aria-live='polite']")).toBeVisible({
      timeout: 20000,
    });
    const ref = (
      (await page.locator(".font-mono.text-base.font-bold.text-ink").textContent()) || ""
    ).trim();

    await loginAsAdmin(page);

    // Export CSV
    const downloadPromise = page.waitForEvent("download");
    await page.locator("a:has-text('Export CSV')").first().click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    let csvText = "";
    for await (const chunk of stream) {
      csvText += chunk.toString();
    }

    // Header row check
    expect(csvText).toMatch(/^"reference","createdAt","name"/);
    // Reference check
    expect(csvText).toContain(ref);
    // Formula name exported with leading apostrophe
    expect(csvText).toContain(`"'${formulaName}"`);
  });

  test("(h) report page for current month shows distinct labels for phone clicks vs estimate requests vs confirmed bookings", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/report");
    await expect(page.locator("h1:has-text('Monthly report')")).toBeVisible();

    const phoneLabel = page.locator("text=Phone clicks").first();
    const estimateLabel = page.locator("text=Estimate requests").first();
    const bookingLabel = page.locator("text=Confirmed bookings").first();

    await expect(phoneLabel).toBeVisible();
    await expect(estimateLabel).toBeVisible();
    await expect(bookingLabel).toBeVisible();

    expect(await phoneLabel.textContent()).not.toEqual(await estimateLabel.textContent());
    expect(await estimateLabel.textContent()).not.toEqual(await bookingLabel.textContent());
    expect(await phoneLabel.textContent()).not.toEqual(await bookingLabel.textContent());
  });

  test("(i) logout clears access", async ({ page }) => {
    await loginAsAdmin(page);

    await page.locator("button:has-text('Log out')").click();
    await expect(page).toHaveURL(/\/admin\/login/);

    // Access to /admin redirects back to login
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    // API calls return 401
    const exportRes = await page.request.get("/api/admin/leads/export?month=2026-10");
    expect(exportRes.status()).toBe(401);
  });

  test("(j) admin pages have noindex", async ({ page }) => {
    // 1. /admin/login
    await page.goto("/admin/login");
    const loginRobots = page.locator("meta[name='robots']");
    await expect(loginRobots).toHaveAttribute("content", /noindex/);

    // 2. /admin
    await loginAsAdmin(page);
    const adminRobots = page.locator("meta[name='robots']");
    await expect(adminRobots).toHaveAttribute("content", /noindex/);

    // 3. /admin/report
    await page.goto("/admin/report");
    const reportRobots = page.locator("meta[name='robots']");
    await expect(reportRobots).toHaveAttribute("content", /noindex/);
  });

  test("mobile layout smoke at 390: list renders without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsAdmin(page);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
