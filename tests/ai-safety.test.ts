import { describe, expect, it } from "vitest";
import { isElectricalHazard, safetyReply } from "@/lib/ai/safety";

describe("electrical safety detection", () => {
  it.each([
    "sparking outlet",
    "smell burning",
    "smoke from panel",
    "got shocked",
    "power line down",
    "wire hanging",
    "water in my panel",
    "breaker hot",
    "breaker melting",
  ])("detects %s", (text) => {
    expect(isElectricalHazard(text)).toBe(true);
  });
  it.each(["smoke detector install", "surge protector", "outlet stopped working"])(
    "does not flag %s",
    (text) => {
      expect(isElectricalHazard(text)).toBe(false);
    },
  );
  it("gives emergency, utility and business contact instructions", () => {
    expect(safetyReply("555-123-4567")).toMatch(/911/);
    expect(safetyReply("555-123-4567")).toMatch(/utility/i);
    expect(safetyReply("555-123-4567")).toContain("555-123-4567");
  });
});
