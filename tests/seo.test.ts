import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { buildMetadata, buildCanonicalUrl } from "@/lib/seo/metadata";
import { buildRobots } from "@/app/robots";
import { buildSitemap } from "@/app/sitemap";
import {
  buildElectricianSchema,
  buildServiceSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  parseDays,
  parseTime,
} from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import demoConfig from "@/clients/demo/client.config";
import type { ClientConfig } from "@/types/client-config";

describe("SEO - Metadata Helper (buildMetadata)", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_ENV;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SITE_ENV = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_ENV;
    }
  });

  it("generates absolute canonical URL with no trailing slash except root", () => {
    expect(buildCanonicalUrl("example.com", "/")).toBe("https://example.com/");
    expect(buildCanonicalUrl("https://example.com/", "")).toBe("https://example.com/");
    expect(buildCanonicalUrl("example.com", "/about")).toBe("https://example.com/about");
    expect(buildCanonicalUrl("example.com", "/services/panel-upgrades/")).toBe(
      "https://example.com/services/panel-upgrades",
    );
    expect(buildCanonicalUrl("example.com/", "contact/")).toBe("https://example.com/contact");
  });

  it("sets robots to { index: false, follow: false } in demo mode", () => {
    delete process.env.NEXT_PUBLIC_SITE_ENV;
    const meta = buildMetadata({
      title: "Test",
      description: "Test desc",
      path: "/",
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("sets robots to { index: false, follow: false } in staging mode", () => {
    process.env.NEXT_PUBLIC_SITE_ENV = "staging";
    const stagingConfig = { ...demoConfig, mode: "staging" as const } as unknown as ClientConfig;
    const meta = buildMetadata(
      {
        title: "Test",
        description: "Test desc",
        path: "/",
      },
      stagingConfig,
    );
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("sets robots to { index: false, follow: false } in production mode when NEXT_PUBLIC_SITE_ENV is not production", () => {
    process.env.NEXT_PUBLIC_SITE_ENV = "staging";
    const prodConfig = { ...demoConfig, mode: "production" as const } as unknown as ClientConfig;
    const meta = buildMetadata(
      {
        title: "Test",
        description: "Test desc",
        path: "/",
      },
      prodConfig,
    );
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("allows indexing in production mode when NEXT_PUBLIC_SITE_ENV is production", () => {
    process.env.NEXT_PUBLIC_SITE_ENV = "production";
    const prodConfig = { ...demoConfig, mode: "production" as const } as unknown as ClientConfig;
    const meta = buildMetadata(
      {
        title: "Test",
        description: "Test desc",
        path: "/services",
      },
      prodConfig,
    );
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.alternates?.canonical).toBe(`https://${demoConfig.business.domain}/services`);
  });

  it("includes openGraph and twitter cards with appropriate defaults", () => {
    const meta = buildMetadata({
      title: "Test Page",
      description: "Description",
      path: "/about",
    });
    expect(meta.openGraph?.siteName).toBe(demoConfig.business.name);
    expect(meta.openGraph?.url).toBe(`https://${demoConfig.business.domain}/about`);
    expect(meta.openGraph?.images).toEqual([{ url: "/images/demo/hero.jpg" }]);
    expect((meta.twitter as Record<string, unknown>)?.card).toBe("summary_large_image");
  });

  it("emits verification.google when gscVerification is configured", () => {
    const customConfig = {
      ...demoConfig,
      seo: { ...demoConfig.seo, gscVerification: "gsc-test-token-123" },
    } as unknown as ClientConfig;

    const meta = buildMetadata(
      {
        title: "Test Page",
        description: "Description",
        path: "/",
      },
      customConfig,
    );
    expect(meta.verification).toEqual({ google: "gsc-test-token-123" });
  });
});

describe("SEO - robots.ts & sitemap.ts", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_ENV;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SITE_ENV = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_ENV;
    }
  });

  it("robots disallows all in demo and staging modes", () => {
    const demoRobots = buildRobots({ ...demoConfig, mode: "demo" } as unknown as ClientConfig);
    expect(demoRobots.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(demoRobots.sitemap).toBeUndefined();

    const stagingRobots = buildRobots({
      ...demoConfig,
      mode: "staging",
    } as unknown as ClientConfig);
    expect(stagingRobots.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(stagingRobots.sitemap).toBeUndefined();
  });

  it("robots allows / and disallows /admin and /api in production", () => {
    process.env.NEXT_PUBLIC_SITE_ENV = "production";
    const prodConfig = {
      ...demoConfig,
      mode: "production" as const,
    } as unknown as ClientConfig;
    const prodRobots = buildRobots(prodConfig);

    expect(prodRobots.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    });
    expect(prodRobots.sitemap).toBe(`https://${demoConfig.business.domain}/sitemap.xml`);
  });

  it("sitemap returns empty array in non-production mode", () => {
    const demoSitemap = buildSitemap({ ...demoConfig, mode: "demo" } as unknown as ClientConfig);
    expect(demoSitemap).toEqual([]);

    const stagingSitemap = buildSitemap({
      ...demoConfig,
      mode: "staging",
    } as unknown as ClientConfig);
    expect(stagingSitemap).toEqual([]);
  });

  it("sitemap returns enabled pages and offered services in production mode", () => {
    process.env.NEXT_PUBLIC_SITE_ENV = "production";
    const prodConfig = {
      ...demoConfig,
      mode: "production" as const,
      pages: [
        { slug: "home", enabled: true },
        { slug: "services", enabled: true },
        { slug: "contact", enabled: false },
      ],
      services: [
        { ...demoConfig.services[0], offered: true },
        { ...demoConfig.services[1], offered: false },
      ],
    } as unknown as ClientConfig;

    const sitemap = buildSitemap(prodConfig);
    const urls = sitemap.map((s) => s.url);

    expect(urls).toContain(`https://${demoConfig.business.domain}/`);
    expect(urls).toContain(`https://${demoConfig.business.domain}/services`);
    expect(urls).not.toContain(`https://${demoConfig.business.domain}/contact`);
    expect(urls).toContain(
      `https://${demoConfig.business.domain}/services/${demoConfig.services[0].slug}`,
    );
    expect(urls).not.toContain(
      `https://${demoConfig.business.domain}/services/${demoConfig.services[1].slug}`,
    );
  });
});

describe("SEO - JSON-LD Schema", () => {
  it("hides address when showPublicly is false", () => {
    const config = {
      ...demoConfig,
      business: {
        ...demoConfig.business,
        address: {
          city: "Denver",
          state: "CO",
          zip: "80202",
          showPublicly: false,
        },
      },
    } as unknown as ClientConfig;

    const schema = buildElectricianSchema(config);
    expect(schema.address).toBeUndefined();
  });

  it("includes address when showPublicly is true", () => {
    const config = {
      ...demoConfig,
      business: {
        ...demoConfig.business,
        address: {
          street: "123 Main St",
          city: "Denver",
          state: "CO",
          zip: "80202",
          showPublicly: true,
        },
      },
    } as unknown as ClientConfig;

    const schema = buildElectricianSchema(config);
    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "123 Main St",
      addressLocality: "Denver",
      addressRegion: "CO",
      postalCode: "80202",
      addressCountry: "US",
    });
  });

  it("excludes unverified, pending, and sample licenses from hasCredential", () => {
    const config = {
      ...demoConfig,
      credentials: {
        ...demoConfig.credentials,
        licenses: [
          {
            label: "Sample License",
            number: "123",
            issuingAuthority: "State Board",
            jurisdiction: "State",
            status: "verified",
            isSample: true, // Should be excluded because isSample
          },
          {
            label: "Pending License",
            number: "456",
            issuingAuthority: "City Dept",
            jurisdiction: "City",
            status: "pending",
            isSample: false, // Should be excluded because status is pending
          },
          {
            label: "Verified Master Electrician",
            number: "ME-9999",
            issuingAuthority: "State Licensing Board",
            jurisdiction: "State",
            status: "verified",
            isSample: false,
            verificationUrl: "https://licensing.state.gov/verify/ME-9999",
          },
        ],
      },
    } as unknown as ClientConfig;

    const schema = buildElectricianSchema(config);
    expect(schema.hasCredential).toEqual([
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "Verified Master Electrician",
        recognizedBy: {
          "@type": "Organization",
          name: "State Licensing Board",
        },
        url: "https://licensing.state.gov/verify/ME-9999",
      },
    ]);
  });

  it("omits hasCredential completely when no verified licenses exist", () => {
    const config = {
      ...demoConfig,
      credentials: {
        ...demoConfig.credentials,
        licenses: [
          {
            label: "Unverified License",
            number: "000",
            issuingAuthority: "Board",
            jurisdiction: "State",
            status: "unverified",
            isSample: false,
          },
        ],
      },
    } as unknown as ClientConfig;

    const schema = buildElectricianSchema(config);
    expect(schema.hasCredential).toBeUndefined();
  });

  it("does not include aggregateRating without verified reviews", () => {
    const config = {
      ...demoConfig,
      reviews: [
        {
          author: "Jane Doe",
          rating: 5,
          text: "Great work!",
          source: "Google",
          verified: false,
        },
      ],
    } as unknown as ClientConfig;

    const schema = buildElectricianSchema(config);
    expect(schema.aggregateRating).toBeUndefined();
  });

  it("computes aggregateRating when >= 1 verified review exists", () => {
    const config = {
      ...demoConfig,
      reviews: [
        {
          author: "Alice",
          rating: 5,
          text: "Excellent service!",
          source: "Google",
          verified: true,
        },
        {
          author: "Bob",
          rating: 4,
          text: "Fast repair.",
          source: "Yelp",
          verified: true,
        },
        {
          author: "Charlie",
          rating: 1,
          text: "Unverified fake review.",
          source: "Web",
          verified: false,
        },
      ],
    } as unknown as ClientConfig;

    const schema = buildElectricianSchema(config);
    expect(schema.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 2,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it("parses day ranges and times robustly into OpeningHoursSpecification", () => {
    expect(parseDays("Monday - Friday")).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);
    expect(parseDays("Mon–Fri")).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    expect(parseDays("Saturday")).toEqual(["Saturday"]);
    expect(parseDays("InvalidDay")).toBeNull();

    expect(parseTime("8:00 AM")).toBe("08:00");
    expect(parseTime("5:00 PM")).toBe("17:00");
    expect(parseTime("12:00 PM")).toBe("12:00");
    expect(parseTime("12:00 AM")).toBe("00:00");
    expect(parseTime("14:30")).toBe("14:30");
    expect(parseTime("99:99")).toBeNull();
  });

  it("builds Service schema with provider @id and areaServed", () => {
    const service = demoConfig.services[0];
    const schema = buildServiceSchema(service);

    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe(service.title);
    expect(schema.provider).toEqual({
      "@type": "Electrician",
      "@id": `https://${demoConfig.business.domain}/#electrician`,
    });
    expect(schema.areaServed).toEqual(demoConfig.serviceAreas.map((sa) => sa.name));
  });

  it("builds BreadcrumbList and FAQ schemas", () => {
    const breadcrumbs = buildBreadcrumbSchema([
      { name: "Home", url: "https://example.com/" },
      { name: "Services", url: "https://example.com/services" },
    ]);
    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement).toHaveLength(2);

    const faqs = buildFaqSchema([{ question: "Q1", answer: "A1" }]);
    expect(faqs?.["@type"]).toBe("FAQPage");
    expect(faqs?.mainEntity).toHaveLength(1);
  });

  it("escapes '<' as \\u003c in JsonLd to prevent script injection", () => {
    const data = {
      malicious: "</script><script>alert('xss')</script>",
      tag: "<tag>",
    };
    const html = renderToString(React.createElement(JsonLd, { data }));

    expect(html).not.toContain("</script><script>");
    expect(html).toContain("\\u003c/script>\\u003cscript>");
    expect(html).toContain("\\u003ctag>");

    // Verify it is still valid JSON when parsed
    const scriptMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const parsed = JSON.parse(scriptMatch![1]);
    expect(parsed.malicious).toBe("</script><script>alert('xss')</script>");
    expect(parsed.tag).toBe("<tag>");
  });
});
