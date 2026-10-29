import { describe, it, expect, vi } from "vitest";
import { validateStaticConfig, parseEnvFile } from "@/scripts/lib/prelaunch.mjs";
import templateConfig from "@/clients/_template/client.config";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

describe("Prelaunch Validation (scripts/lib/prelaunch.mjs)", () => {
  const validProductionEnv: Record<string, string> = {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db?sslmode=require",
    RESEND_API_KEY: "re_valid_key",
    IP_HASH_SECRET: "secret-hash-salt-32bytes-base64url",
    ADMIN_PASSWORD_HASH: "scrypt-hashed-password",
    ADMIN_SESSION_SECRET: "admin-session-signing-key",
    AI_SESSION_SECRET: "ai-session-signing-key",
    CRON_SECRET: "cron-secret-key",
    NEXT_PUBLIC_SITE_ENV: "production",
  };

  const syntheticValidConfig = {
    mode: "production" as const,
    business: {
      name: "Apex Electrical Services",
      legalName: "Apex Electrical Services LLC",
      domain: "apexelectric.com",
      phone: "+15551234567",
      phoneDisplay: "(555) 123-4567",
      email: "info@apexelectric.com",
      timezone: "America/Denver",
      address: {
        street: "100 Broadway",
        city: "Denver",
        state: "CO",
        zip: "80202",
        showPublicly: true,
      },
    },
    positioning: {
      heroHeadline: "Licensed & Insured Electrical Specialists.",
      heroSubhead: "Prompt electrical service across Denver.",
      closingHeadline: "Schedule your estimate today.",
    },
    practices: [],
    hours: [{ days: "Monday - Friday", open: "8:00 AM", close: "5:00 PM" }],
    emergency: { offered: false, verified: false },
    serviceAreas: [{ name: "Denver Metro", zipCodes: ["80202"], description: "Denver area" }],
    services: [
      {
        slug: "panel-upgrades",
        title: "Panel Upgrades",
        shortDescription: "Panel replacements and subpanels.",
        icon: "Panel",
        formType: "panel" as const,
        offered: true,
        featured: true,
        signs: ["Tripping breakers"],
        process: ["Inspection", "Permit", "Install"],
        faqs: [],
      },
    ],
    pages: [
      { slug: "home", enabled: true },
      { slug: "services", enabled: true },
      { slug: "about", enabled: true },
      { slug: "contact", enabled: true },
    ],
    credentials: {
      licenses: [
        {
          label: "Master Electrician",
          number: "ME-12345",
          issuingAuthority: "Colorado DORA",
          jurisdiction: "Colorado",
          status: "verified" as const,
          verifiedAt: "2026-01-15",
          verifiedBy: "Compliance Team",
          isSample: false,
        },
      ],
      insurance: {
        carrier: "Travelers",
        coverage: "$2M Aggregate",
        status: "verified" as const,
        verifiedAt: "2026-01-15",
        isSample: false,
      },
      certifications: [],
    },
    reviews: [],
    projects: [],
    faqs: [],
    branding: { primary: "#0B1726", accent: "#F2A516" },
    notifications: {
      recipients: ["leads@apexelectric.com"],
      fromAddress: "inquiries@notifications.apexelectric.com",
    },
    seo: {
      titleTemplate: "%s | Apex Electrical Services",
      defaultDescription: "Licensed commercial and residential electricians in Denver, CO.",
    },
    analytics: { enabled: true },
    uploads: { enabled: true, maxFiles: 3, maxBytesPerFile: 4194304, retentionDays: 180 },
    ai: {
      enabled: false,
      model: "deepseek/deepseek-v4.1-flash",
      monthlyConversationAllowance: 100,
      maxVisitorMessagesPerConversation: 15,
      sessionInactivityMinutes: 30,
      maxOutputTokens: 500,
      newConversationsPerVisitorPerDay: 4,
      displayName: "Apex Assistant",
      approvedKnowledge: [],
    },
  };

  it("fails static checks on template config", () => {
    const result = validateStaticConfig(templateConfig, validProductionEnv);
    expect(result.valid).toBe(false);
    expect(result.problems).toContain("Active config contains __REQUIRED__ placeholders");
  });

  it("passes static checks on a synthetic valid production config object", () => {
    const result = validateStaticConfig(syntheticValidConfig, validProductionEnv);
    expect(result.valid).toBe(true);
    expect(result.problems).toEqual([]);
  });

  it("passes with warning when credentials.licenses is explicitly empty", () => {
    const warningFn = vi.fn();
    const config = {
      ...syntheticValidConfig,
      credentials: {
        ...syntheticValidConfig.credentials,
        licenses: [],
      },
    };

    const result = validateStaticConfig(config, validProductionEnv, {
      onWarning: warningFn,
    });

    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes("Explicitly empty credentials"))).toBe(true);
    expect(warningFn).toHaveBeenCalled();
  });

  it("fails when credentials.licenses contains items but none are verified", () => {
    const config = {
      ...syntheticValidConfig,
      credentials: {
        ...syntheticValidConfig.credentials,
        licenses: [
          {
            label: "Contractor License",
            number: "UNV-123",
            issuingAuthority: "State Board",
            jurisdiction: "State",
            status: "unverified" as const,
            isSample: false,
          },
          {
            label: "Sample License",
            number: "SMP-456",
            issuingAuthority: "State Board",
            jurisdiction: "State",
            status: "verified" as const,
            isSample: true, // Sample license does not satisfy verified requirement
          },
        ],
      },
    };

    const result = validateStaticConfig(config, validProductionEnv);
    expect(result.valid).toBe(false);
    expect(result.problems.some((p) => p.includes("none are verified"))).toBe(true);
  });

  it("fails when business domain is not a bare host", () => {
    const invalidDomains = [
      "https://apexelectric.com",
      "http://apexelectric.com",
      "apexelectric.com/",
      "invalid domain",
    ];

    for (const d of invalidDomains) {
      const config = {
        ...syntheticValidConfig,
        business: {
          ...syntheticValidConfig.business,
          domain: d,
        },
      };

      const result = validateStaticConfig(config, validProductionEnv);
      expect(result.valid).toBe(false);
      expect(result.problems.some((p) => p.includes("bare hostname"))).toBe(true);
    }
  });

  it("fails when phone is not in E.164 format", () => {
    const invalidPhones = ["(555) 123-4567", "555-123-4567", "5551234567", "15551234567"];

    for (const phone of invalidPhones) {
      const config = {
        ...syntheticValidConfig,
        business: {
          ...syntheticValidConfig.business,
          phone,
        },
      };

      const result = validateStaticConfig(config, validProductionEnv);
      expect(result.valid).toBe(false);
      expect(result.problems.some((p) => p.includes("E.164 format"))).toBe(true);
    }
  });

  it("fails when notification recipient is example.com or invalid", () => {
    const config = {
      ...syntheticValidConfig,
      notifications: {
        recipients: ["admin@example.com"],
        fromAddress: "inquiries@notifications.apexelectric.com",
      },
    };

    const result = validateStaticConfig(config, validProductionEnv);
    expect(result.valid).toBe(false);
    expect(result.problems.some((p) => p.includes("non-example address"))).toBe(true);
  });

  it("fails when no services are offered", () => {
    const config = {
      ...syntheticValidConfig,
      services: [
        {
          ...syntheticValidConfig.services[0],
          offered: false,
        },
      ],
    };

    const result = validateStaticConfig(config, validProductionEnv);
    expect(result.valid).toBe(false);
    expect(
      result.problems.some((p) => p.includes("At least one service must be marked as offered")),
    ).toBe(true);
  });

  it("fails when more than 8 pages are enabled", () => {
    const config = {
      ...syntheticValidConfig,
      pages: [
        { slug: "p1", enabled: true },
        { slug: "p2", enabled: true },
        { slug: "p3", enabled: true },
        { slug: "p4", enabled: true },
        { slug: "p5", enabled: true },
        { slug: "p6", enabled: true },
        { slug: "p7", enabled: true },
        { slug: "p8", enabled: true },
        { slug: "p9", enabled: true },
      ],
    };

    const result = validateStaticConfig(config, validProductionEnv);
    expect(result.valid).toBe(false);
    expect(result.problems.some((p) => p.includes("At most 8 pages may be enabled"))).toBe(true);
  });

  it("parses env file correctly", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "env-test-"));
    const envFile = path.join(tempDir, ".env");
    fs.writeFileSync(
      envFile,
      `# Comment line
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RESEND_API_KEY=re_123456
EMPTY_VAL=
QUOTED_VAL='single quoted value'
`,
    );

    const parsed = parseEnvFile(envFile) as Record<string, string>;
    expect(parsed.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/db");
    expect(parsed.RESEND_API_KEY).toBe("re_123456");
    expect(parsed.EMPTY_VAL).toBe("");
    expect(parsed.QUOTED_VAL).toBe("single quoted value");

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
