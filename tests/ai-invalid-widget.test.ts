import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { InvalidFields } from "@/components/ai/InvalidFields";
it("renders human-readable fields to correct", () => {
  expect(
    renderToStaticMarkup(createElement(InvalidFields, { fields: ["name", "zip", "serviceSlug"] })),
  ).toContain("Please correct these fields: name, ZIP code, service.");
});
