import type { ClientConfig } from "@/types/client-config";

export function isIndexable(config: ClientConfig): boolean {
  return config.mode === "production" && process.env.NEXT_PUBLIC_SITE_ENV === "production";
}
