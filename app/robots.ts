import type { MetadataRoute } from "next";
import { parsedClientConfig } from "@/config/client.config";
import type { ClientConfig } from "@/types/client-config";
import { isIndexable } from "@/lib/seo/indexable";

export function buildRobots(config: ClientConfig = parsedClientConfig): MetadataRoute.Robots {
  if (!isIndexable(config)) {
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
