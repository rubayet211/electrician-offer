import type { Metadata } from "next";
import { parsedClientConfig } from "@/config/client.config";
import type { ClientConfig } from "@/types/client-config";

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function buildCanonicalUrl(domain: string, path: string): string {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/" || normalizedPath === "") {
    return `https://${cleanDomain}/`;
  }
  const cleanPath = normalizedPath.replace(/\/+$/, "");
  return `https://${cleanDomain}${cleanPath}`;
}

export function buildMetadata(
  { title, description, path, image }: BuildMetadataOptions,
  customConfig?: ClientConfig,
): Metadata {
  const config = customConfig || parsedClientConfig;
  const canonical = buildCanonicalUrl(config.business.domain, path);

  const ogImage =
    image || config.seo.ogImage || (config.mode === "demo" ? "/images/demo/hero.jpg" : undefined);

  const isProduction =
    config.mode === "production" && process.env.NEXT_PUBLIC_SITE_ENV === "production";

  const robots = isProduction ? { index: true, follow: true } : { index: false, follow: false };

  const verification: Metadata["verification"] = config.seo.gscVerification
    ? { google: config.seo.gscVerification }
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: config.business.name,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots,
    ...(verification ? { verification } : {}),
  };
}
