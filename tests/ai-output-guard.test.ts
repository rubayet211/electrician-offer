import { expect, it } from "vitest";
import { guardAssistantText } from "@/lib/ai/output-guard";

it.each([
  "turn off the breaker and check it",
  "remove the cover",
  "open the panel",
  "use a voltage tester",
  "replace the outlet yourself",
  "It costs $50",
  "Same-day service is available",
  "We can come same day",
  "We can come today",
  "Someone has been dispatched",
  "This is code compliant",
  "Your wiring is up to code",
  "Our license number is ABC-123",
])("replaces unsafe assistant text: %s", (text) => {
  expect(guardAssistantText(text, [])).not.toBe(text);
});

it("preserves approved license numbers and ordinary text", () => {
  expect(guardAssistantText("License number ABC-123", ["ABC-123"])).toBe("License number ABC-123");
  expect(guardAssistantText("Call our office to discuss your request.", [])).toBe(
    "Call our office to discuss your request.",
  );
});
