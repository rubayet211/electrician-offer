import type { MetadataRoute } from "next";
import { parsedClientConfig } from "@/config/client.config";
import type { ClientConfig } from "@/types/client-config";

export function buildSitemap(config: ClientConfig = parsedClientConfig): MetadataRoute.Sitemap {
  const isProduction =
    config.mode === "production" &&
    (process.env.NEXT_PUBLIC_SITE_ENV === undefined ||
      process.env.NEXT_PUBLIC_SITE_ENV === "production");

  if (!isProduction) {
    return [];
  }

  const domain = config.business.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const baseUrl = `https://${domain}`;
  const lastModified = new Date();

  const enabledPages = (config.pages || []).filter((p) => p.enabled);
  const pageEntries: MetadataRoute.Sitemap = enabledPages.map((p) => {
    const slug = p.slug.trim().replace(/^\/+/, "");
    const url = slug === "home" || slug === "" ? `${baseUrl}/` : `${baseUrl}/${slug}`;
    const priority = slug === "home" || slug === "" ? 1.0 : slug === "services" ? 0.9 : 0.8;
    return {
      url,
      lastModified,
      changeFrequency: "weekly",
      priority,
    };
  });

  const offeredServices = (config.services || []).filter((s) => s.offered);
  const serviceEntries: MetadataRoute.Sitemap = offeredServices.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pageEntries, ...serviceEntries];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(parsedClientConfig);
}
