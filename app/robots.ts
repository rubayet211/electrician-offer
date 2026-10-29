import type { MetadataRoute } from "next";
import { parsedClientConfig } from "@/config/client.config";
import type { ClientConfig } from "@/types/client-config";

export function buildRobots(config: ClientConfig = parsedClientConfig): MetadataRoute.Robots {
  const isProduction =
    config.mode === "production" &&
    (process.env.NEXT_PUBLIC_SITE_ENV === undefined ||
      process.env.NEXT_PUBLIC_SITE_ENV === "production");

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const domain = config.business.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  };
}

export default function robots(): MetadataRoute.Robots {
  return buildRobots(parsedClientConfig);
}
