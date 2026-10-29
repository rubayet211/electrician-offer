import { getStore } from "@/lib/store";
export const hitRateLimit = (key: string, limit: number, windowMs: number) =>
  getStore().rateLimit.hit(key, limit, windowMs);
