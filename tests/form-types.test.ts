import { expect, it } from "vitest";
import { inquirySchema } from "@/lib/inquiries/schema";
const base = {
  name: "Alex",
  phone: "(555) 010-0142",
  zip: "12345",
  description: "Planning electrical work",
  urgency: "routine",
  consent: true,
  idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
};
const cases = [
  ["repair-troubleshooting", { formType: "troubleshooting", startedWhen: "today" }],
  ["panel-upgrades", { formType: "panel", reason: "adding_load", propertyType: "single_family" }],
  [
    "ev-charger-installation",
    {
      formType: "ev_charger",
      propertyType: "residential",
      ownsCharger: "no",
      installLocation: "garage",
    },
  ],
  [
    "lighting-installation",
    { formType: "lighting", setting: "both", fixtureCount: "2-5", installType: "new" },
  ],
  [
    "generator-installation",
    { formType: "generator", generatorType: "standby", propertyType: "residential" },
  ],
  ["outlets-switches", { formType: "general" }],
] as const;
it.each(cases)("validates %s details", (serviceSlug, details) => {
  const result = inquirySchema.safeParse({ ...base, serviceSlug, details });
  expect(result.success).toBe(true);
  if (result.success) expect(result.data.phone).toBe("+15550100142");
  expect(
    inquirySchema.safeParse({ ...base, serviceSlug, details: { ...details, formType: "invalid" } })
      .success,
  ).toBe(false);
});
