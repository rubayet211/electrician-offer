import { createHmac } from "node:crypto";
export function hashIp(ip: string): string {
  const secret =
    process.env.IP_HASH_SECRET ||
    (process.env.NODE_ENV === "production" ? undefined : "local-development-only");
  if (!secret) throw new Error("IP_HASH_SECRET is required");
  return createHmac("sha256", secret).update(ip).digest("hex");
}
