import { z } from "zod";

export const formType = z.enum([
  "troubleshooting",
  "panel",
  "ev_charger",
  "lighting",
  "generator",
  "general",
]);
export const formTypeSchema = formType;
const text = z.string().min(1);
const status = z.enum(["verified", "pending", "unverified"]);
const faq = z.object({ question: text, answer: text });
export const clientConfigSchema = z.object({
  mode: z.enum(["demo", "staging", "production"]),
  business: z.object({
    name: text,
    legalName: text.optional(),
    domain: text,
    phone: text,
    phoneDisplay: text,
    email: text,
    timezone: text.refine((value) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Invalid time zone"),
    address: z.object({
      street: text.optional(),
      city: text,
      state: text,
      zip: text,
      showPublicly: z.boolean(),
    }),
    yearsInBusiness: z.number().optional(),
    ownerName: text.optional(),
  }),
  positioning: z
    .object({
      heroHeadline: text.default("Electrical Work Done Right. A Clear Way to Get Started."),
      heroSubhead: text.optional(),
      tagline: text.optional(),
      closingHeadline: text.optional(),
    })
    .default({
      heroHeadline: "Electrical Work Done Right. A Clear Way to Get Started.",
    }),
  practices: z.array(z.object({ title: text, description: text })).default([]),
  hours: z.array(z.object({ days: text, open: text, close: text })),
  emergency: z.object({
    offered: z.boolean(),
    verified: z.boolean(),
    description: text.optional(),
  }),
  serviceAreas: z.array(z.object({ name: text, zipCodes: z.array(z.string()), description: text })),
  services: z.array(
    z.object({
      slug: text,
      title: text,
      shortDescription: text,
      icon: text,
      formType,
      offered: z.boolean(),
      featured: z.boolean(),
      headline: text.optional(),
      intro: text.optional(),
      signs: z.array(text),
      process: z.array(text),
      faqs: z.array(faq),
    }),
  ),
  pages: z
    .array(z.object({ slug: text, enabled: z.boolean() }))
    .refine(
      (pages) => pages.filter((p) => p.enabled).length <= 8,
      "At most eight pages may be enabled",
    ),
  credentials: z.object({
    licenses: z.array(
      z.object({
        label: text,
        number: text,
        issuingAuthority: text,
        jurisdiction: text,
        verificationUrl: z.string().url().optional(),
        status,
        verifiedAt: text.optional(),
        verifiedBy: text.optional(),
        isSample: z.boolean().default(false),
      }),
    ),
    insurance: z.object({
      carrier: text.optional(),
      coverage: text.optional(),
      status,
      verifiedAt: text.optional(),
      isSample: z.boolean().default(false),
    }),
    bonded: z.boolean().optional(),
    certifications: z.array(
      z.object({ label: text, status, isSample: z.boolean().default(false) }),
    ),
  }),
  reviews: z.array(
    z.object({
      author: text,
      rating: z.number().min(1).max(5),
      text,
      source: text,
      url: z.string().url().optional(),
      date: text.optional(),
      verified: z.boolean(),
    }),
  ),
  projects: z.array(
    z.object({ title: text, image: text, alt: text, description: text, isSample: z.boolean() }),
  ),
  faqs: z.array(faq),
  branding: z.object({ logo: text.optional(), primary: text, accent: text }),
  notifications: z.object({ recipients: z.array(z.email()).min(1), fromAddress: text }),
  seo: z.object({
    titleTemplate: text,
    defaultDescription: text,
    ogImage: text.optional(),
    gscVerification: text.optional(),
  }),
  analytics: z.object({ enabled: z.boolean() }),
  uploads: z.object({
    enabled: z.boolean(),
    maxFiles: z.number().int().positive().default(3),
    maxBytesPerFile: z
      .number()
      .int()
      .positive()
      .default(4 * 1024 * 1024),
    retentionDays: z.number().int().positive().default(180),
  }),
  ai: z.object({
    enabled: z.boolean(),
    model: text.default("deepseek/deepseek-v4.1-flash"),
    monthlyConversationAllowance: z.number().int().nonnegative().default(100),
    maxVisitorMessagesPerConversation: z.number().int().positive().default(15),
    sessionInactivityMinutes: z.number().int().positive().default(30),
    maxOutputTokens: z.number().int().positive().default(500),
    newConversationsPerVisitorPerDay: z.number().int().positive().default(4),
    displayName: text,
    approvedKnowledge: z.array(z.object({ topic: text, answer: text })),
  }),
});
export type ClientConfig = z.infer<typeof clientConfigSchema>;
export type FormType = z.infer<typeof formType>;
