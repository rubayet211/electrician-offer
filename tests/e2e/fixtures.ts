import { test as base } from "@playwright/test";
import { randomInt } from "node:crypto";

export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";

// Each test acts as a distinct visitor. Production trusts only Vercel's x-vercel-forwarded-for,
// so without this every e2e request shares one "unknown" rate-limit bucket.
export const test = base.extend({
  page: async ({ page }, provide) => {
    const ip = `198.51.100.${randomInt(1, 255)}`;
    await page.setExtraHTTPHeaders({ "x-vercel-forwarded-for": ip });
    await provide(page);
  },
});
