import { createHash, timingSafeEqual } from "node:crypto";
export function authorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const supplied = req.headers.get("authorization") ?? "";
  return timingSafeEqual(
    createHash("sha256").update(supplied).digest(),
    createHash("sha256").update(`Bearer ${secret}`).digest(),
  );
}
