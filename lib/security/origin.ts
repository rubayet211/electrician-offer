import { parsedClientConfig } from "@/config/client.config";
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false;
    const allowed = [
      parsedClientConfig.business.domain,
      `www.${parsedClientConfig.business.domain}`,
      process.env.VERCEL_URL,
    ].filter(Boolean);
    return (
      allowed.includes(url.host) ||
      (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
}
