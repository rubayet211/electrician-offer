import { parsedClientConfig } from "@/config/client.config";
import type { ClientConfig } from "@/types/client-config";

const DAY_MAP: Record<string, string> = {
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
  sun: "Sunday",
  sunday: "Sunday",
};

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function parseDays(daysStr: string): string[] | null {
  const clean = daysStr.trim().toLowerCase();

  // Try range: "Monday - Friday", "Mon-Fri", "Monday to Friday"
  const rangeMatch = clean.match(/^([a-z]+)\s*(?:[-–—]|to)\s*([a-z]+)$/);
  if (rangeMatch) {
    const startDay = DAY_MAP[rangeMatch[1]];
    const endDay = DAY_MAP[rangeMatch[2]];
    if (startDay && endDay) {
      const startIdx = ALL_DAYS.indexOf(startDay as (typeof ALL_DAYS)[number]);
      const endIdx = ALL_DAYS.indexOf(endDay as (typeof ALL_DAYS)[number]);
      if (startIdx !== -1 && endIdx !== -1) {
        if (startIdx <= endIdx) {
          return ALL_DAYS.slice(startIdx, endIdx + 1);
        } else {
          // Wrapped range, e.g. Friday to Monday
          return [...ALL_DAYS.slice(startIdx), ...ALL_DAYS.slice(0, endIdx + 1)];
        }
      }
    }
  }

  // Try comma, slash, or "&" separated list: "Monday, Wednesday, Friday"
  const parts = clean.split(/[,/&]|\band\b/).map((p) => p.trim());
  const resolved: string[] = [];
  for (const part of parts) {
    const mapped = DAY_MAP[part];
    if (mapped) {
      if (!resolved.includes(mapped)) {
        resolved.push(mapped);
      }
    }
  }

  if (resolved.length > 0) {
    return resolved;
  }

  // Single day: "Saturday"
  if (DAY_MAP[clean]) {
    return [DAY_MAP[clean]];
  }

  return null;
}

export function parseTime(timeStr: string): string | null {
  const clean = timeStr.trim();
  // 12-hour format: "8:00 AM", "5:00 PM", "8am", "5:30pm"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridian = match12[3].toLowerCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

    if (meridian === "am") {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }

    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // 24-hour format: "08:00", "17:00"
  const match24 = clean.match(/^(\d{2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return clean;
    }
  }

  return null;
}

export function buildElectricianSchema(customConfig?: ClientConfig): Record<string, unknown> {
  const config = customConfig || parsedClientConfig;
  const cleanDomain = config.business.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": `https://${cleanDomain}/#electrician`,
    name: config.business.name,
    url: `https://${cleanDomain}/`,
    telephone: config.business.phone,
  };

  if (config.business.email) {
    schema.email = config.business.email;
  }

  if (config.business.address.showPublicly) {
    schema.address = {
      "@type": "PostalAddress",
      ...(config.business.address.street ? { streetAddress: config.business.address.street } : {}),
      addressLocality: config.business.address.city,
      addressRegion: config.business.address.state,
      postalCode: config.business.address.zip,
      addressCountry: "US",
    };
  }

  if (config.serviceAreas && config.serviceAreas.length > 0) {
    schema.areaServed = config.serviceAreas.map((sa) => sa.name);
  }

  if (config.hours && config.hours.length > 0) {
    const specs: Array<Record<string, unknown>> = [];
    for (const h of config.hours) {
      const days = parseDays(h.days);
      const opens = parseTime(h.open);
      const closes = parseTime(h.close);

      if (days && opens && closes) {
        specs.push({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: days,
          opens,
          closes,
        });
      }
    }
    if (specs.length > 0) {
      schema.openingHoursSpecification = specs;
    }
  }

  // Credentials: ONLY verified licenses (never sample or unverified)
  const verifiedLicenses = (config.credentials?.licenses || []).filter(
    (l) => l.status === "verified" && !l.isSample,
  );
  if (verifiedLicenses.length > 0) {
    schema.hasCredential = verifiedLicenses.map((lic) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: lic.label,
      recognizedBy: {
        "@type": "Organization",
        name: lic.issuingAuthority,
      },
      ...(lic.verificationUrl ? { url: lic.verificationUrl } : {}),
    }));
  }

  // AggregateRating: ONLY if >= 1 verified review
  const verifiedReviews = (config.reviews || []).filter((r) => r.verified === true);
  if (verifiedReviews.length >= 1) {
    const sum = verifiedReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / verifiedReviews.length) * 10) / 10;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avg,
      reviewCount: verifiedReviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function buildServiceSchema(
  service: ClientConfig["services"][number],
  customConfig?: ClientConfig,
): Record<string, unknown> {
  const config = customConfig || parsedClientConfig;
  const cleanDomain = config.business.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    provider: {
      "@type": "Electrician",
      "@id": `https://${cleanDomain}/#electrician`,
    },
    url: `https://${cleanDomain}/services/${service.slug}`,
  };

  const desc = service.shortDescription || service.intro;
  if (desc) {
    schema.description = desc;
  }

  if (config.serviceAreas && config.serviceAreas.length > 0) {
    schema.areaServed = config.serviceAreas.map((sa) => sa.name);
  }

  return schema;
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, unknown> | null {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
