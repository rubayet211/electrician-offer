import { logEvent } from "@/lib/log";
export function clientIp(request: Request): string {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip && process.env.NODE_ENV === "production") logEvent("missing_client_ip");
  return ip || "unknown";
}
