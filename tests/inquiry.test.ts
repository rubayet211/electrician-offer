import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/inquiries/schema";
import { validateUploads } from "@/lib/uploads/validate";
import { isSpam } from "@/lib/security/spam";
const base = {
  name: "Alex",
  phone: "5550100142",
  zip: "12345",
  serviceSlug: "panel-upgrades",
  description: "Planning an upgrade",
  urgency: "routine",
  consent: true,
  idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
  details: { formType: "panel", reason: "adding_load", propertyType: "single_family" },
};
describe("inquiry validation", () => {
  it("accepts panel details without panel specifications", () =>
    expect(inquirySchema.safeParse(base).success).toBe(true));
  it("rejects an incorrect detail type", () =>
    expect(
      inquirySchema.safeParse({
        ...base,
        details: { formType: "panel", reason: "invalid", propertyType: "single_family" },
      }).success,
    ).toBe(false));
  it("detects spam", () => {
    expect(isSpam("site", Date.now() - 5000)).toBe(true);
    expect(isSpam("", Date.now())).toBe(true);
  });
  it("rejects invalid image bytes", async () => {
    const result = await validateUploads([
      new File(["not an image"], "x.png", { type: "image/png" }),
    ]);
    expect(result.files).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });
});
