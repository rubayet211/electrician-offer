import { describe, expect, it } from "vitest";
import { clientConfigSchema } from "@/types/client-config";
import demo from "@/clients/demo/client.config";
import { normalizePhone } from "@/lib/inquiries/schema";
describe("public contracts", () => {
  it("validates the demo and limits enabled pages", () => {
    expect(clientConfigSchema.safeParse(demo).success).toBe(true);
    expect(
      clientConfigSchema.safeParse({
        ...demo,
        pages: Array.from({ length: 9 }, (_, i) => ({ slug: `page-${i}`, enabled: true })),
      }).success,
    ).toBe(false);
  });
  it("normalizes US phone numbers", () => {
    expect(normalizePhone("(555) 010-0142")).toBe("+15550100142");
    expect(normalizePhone("123")).toBeNull();
  });
});
