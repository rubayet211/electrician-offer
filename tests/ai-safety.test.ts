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

it.each([
  "my breaker box is smoking",
  "I smell something burning near the panel",
  "kid got zapped by outlet",
  "I got a shock from the switch",
  "electric shock",
  "outlet is hot and has burn marks",
  "my outlet is melted",
  "panel is buzzing loudly",
  "wires are sizzling",
  "it smells like something is burning",
  "tree fell on the power line",
  "water pouring into the breaker box",
  "there are sparks coming from my outlet",
  "smoke coming out of the light fixture",
  "power line down in my yard",
  "scorch marks on the wall plate",
])("detects reported hazard: %s", (text) => {
  expect(isElectricalHazard(text)).toBe(true);
});

it.each([
  "smoke alarm install",
  "smoke detector replacement",
  "fire alarm wiring quote",
  "fire pit lighting",
  "I was shocked by the quote price",
  "what is the fire code for smoke detectors",
  "surge protector",
  "outlet stopped working",
  "breaker keeps tripping",
])("does not flag non-hazard: %s", (text) => {
  expect(isElectricalHazard(text)).toBe(false);
});
