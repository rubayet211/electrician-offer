import { z } from "zod";
import { getService } from "@/lib/config/site";
export function normalizePhone(value: string): string | null {
  if (!/^[+()\d.\s-]{10,25}$/.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return national.length === 10 ? `+1${national}` : null;
}
const options = <T extends readonly [string, ...string[]]>(values: T) =>
  values.map((value) => ({
    value,
    label: value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()),
  }));
export const PANEL_REASON_OPTIONS = options([
  "adding_load",
  "ev_charger",
  "renovation",
  "old_or_problem_panel",
  "insurance_or_sale",
  "other",
]);
export const PANEL_PROPERTY_OPTIONS = options([
  "single_family",
  "townhome_condo",
  "multi_family",
  "commercial",
]);
export const PROPERTY_OPTIONS = options(["residential", "commercial"]);
export const OWNS_CHARGER_OPTIONS = options(["yes", "no", "not_sure"]);
export const INSTALL_LOCATION_OPTIONS = options([
  "garage",
  "driveway_exterior",
  "parking_lot",
  "other",
]);
export const STARTED_WHEN_OPTIONS = options(["today", "this_week", "longer", "not_sure"]);
export const LIGHTING_SETTING_OPTIONS = options(["indoor", "outdoor", "both"]);
export const FIXTURE_COUNT_OPTIONS = options(["1", "2-5", "6-10", "10+"]);
export const INSTALL_TYPE_OPTIONS = options(["new", "replacement", "not_sure"]);
export const GENERATOR_TYPE_OPTIONS = options(["standby", "portable_inlet", "not_sure"]);
export const FORM_FIELDS_BY_TYPE = {
  panel: [
    { name: "reason", label: "Reason", options: PANEL_REASON_OPTIONS },
    { name: "panelInfoKnown", label: "Panel information, only if known" },
    { name: "propertyType", label: "Property type", options: PANEL_PROPERTY_OPTIONS },
  ],
  ev_charger: [
    { name: "vehicleOrCharger", label: "Vehicle or charger" },
    { name: "propertyType", label: "Property type", options: PROPERTY_OPTIONS },
    { name: "ownsCharger", label: "Already own a charger?", options: OWNS_CHARGER_OPTIONS },
    { name: "installLocation", label: "Installation location", options: INSTALL_LOCATION_OPTIONS },
  ],
  troubleshooting: [
    { name: "startedWhen", label: "When did it start?", options: STARTED_WHEN_OPTIONS },
  ],
  lighting: [
    { name: "setting", label: "Setting", options: LIGHTING_SETTING_OPTIONS },
    { name: "fixtureCount", label: "Fixture count", options: FIXTURE_COUNT_OPTIONS },
    { name: "installType", label: "Installation type", options: INSTALL_TYPE_OPTIONS },
  ],
  generator: [
    { name: "generatorType", label: "Generator type", options: GENERATOR_TYPE_OPTIONS },
    { name: "propertyType", label: "Property type", options: PROPERTY_OPTIONS },
    { name: "requirements", label: "Requirements" },
  ],
  general: [],
} as const;
export const detailsSchema = z.discriminatedUnion("formType", [
  z.object({
    formType: z.literal("panel"),
    reason: z.enum([
      "adding_load",
      "ev_charger",
      "renovation",
      "old_or_problem_panel",
      "insurance_or_sale",
      "other",
    ]),
    panelInfoKnown: z.string().trim().max(200).optional(),
    propertyType: z.enum(["single_family", "townhome_condo", "multi_family", "commercial"]),
  }),
  z.object({
    formType: z.literal("ev_charger"),
    vehicleOrCharger: z.string().trim().max(120).optional(),
    propertyType: z.enum(["residential", "commercial"]),
    ownsCharger: z.enum(["yes", "no", "not_sure"]),
    installLocation: z.enum(["garage", "driveway_exterior", "parking_lot", "other"]),
  }),
  z.object({
    formType: z.literal("troubleshooting"),
    startedWhen: z.enum(["today", "this_week", "longer", "not_sure"]),
  }),
  z.object({
    formType: z.literal("lighting"),
    setting: z.enum(["indoor", "outdoor", "both"]),
    fixtureCount: z.enum(["1", "2-5", "6-10", "10+"]),
    installType: z.enum(["new", "replacement", "not_sure"]),
  }),
  z.object({
    formType: z.literal("generator"),
    generatorType: z.enum(["standby", "portable_inlet", "not_sure"]),
    propertyType: z.enum(["residential", "commercial"]),
    requirements: z.string().trim().max(500).optional(),
  }),
  z.object({ formType: z.literal("general") }),
]);
export const inquiryBaseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .refine((value) => normalizePhone(value) !== null, "Enter a US phone number")
    .transform((value) => normalizePhone(value)!),
  email: z.union([z.email(), z.literal("")]).optional(),
  zip: z.union([z.string().regex(/^\d{5}$/), z.literal("")]).optional(),
  location: z.string().trim().max(200).optional(),
  serviceSlug: z.string(),
  description: z.string().trim().min(10).max(2000),
  urgency: z.enum(["routine", "soon", "urgent"]),
  consent: z.literal(true),
  details: detailsSchema,
  company_website: z.string().max(200).optional(),
  formStartedAt: z.coerce.number().optional(),
  idempotencyKey: z.uuid(),
  sourcePage: z
    .string()
    .regex(/^\/[A-Za-z0-9/_-]{0,200}$/)
    .optional(),
  utm: z
    .record(z.string().regex(/^[a-z_]{1,32}$/), z.string().max(120))
    .refine((value) => Object.keys(value).length <= 10)
    .optional(),
});
const aiInquiryBaseSchema = inquiryBaseSchema.extend({ details: detailsSchema.optional() });
function validateInquiry(value: z.infer<typeof aiInquiryBaseSchema>, ctx: z.RefinementCtx) {
  if (!value.zip && !value.location)
    ctx.addIssue({ code: "custom", path: ["zip"], message: "Enter a ZIP code or location" });
  const service = getService(value.serviceSlug);
  if (!service)
    ctx.addIssue({ code: "custom", path: ["serviceSlug"], message: "Select an offered service" });
  else if (value.details && service.formType !== value.details.formType)
    ctx.addIssue({ code: "custom", path: ["details"], message: "Details must match service" });
}
export const inquirySchema = inquiryBaseSchema.superRefine(validateInquiry);
export const aiInquirySchema = aiInquiryBaseSchema.superRefine(validateInquiry);
export type Inquiry = z.infer<typeof aiInquirySchema>;
