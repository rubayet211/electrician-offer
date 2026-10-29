import { afterEach, expect, it } from "vitest";
import { parsedClientConfig } from "@/config/client.config";
import { monthBounds, monthKey } from "@/lib/reporting/time";
const original = parsedClientConfig.business.timezone;
afterEach(() => {
  parsedClientConfig.business.timezone = original;
});
it("uses business time for month boundaries across daylight saving changes", () => {
  parsedClientConfig.business.timezone = "America/New_York";
  expect(monthBounds("2026-03").map((d) => d.toISOString())).toEqual([
    "2026-03-01T05:00:00.000Z",
    "2026-04-01T04:00:00.000Z",
  ]);
  expect(monthKey(new Date("2026-03-01T02:00:00Z"))).toBe("2026-02");
});
