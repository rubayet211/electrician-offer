import { readBody } from "@/lib/http/read-body";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { isAllowedOrigin } from "@/lib/security/origin";
import { hashIp } from "@/lib/security/hash";
import { clientIp } from "@/lib/security/client-ip";
import { getService } from "@/lib/config/site";
import { parsedClientConfig } from "@/config/client.config";
const schema = z
  .object({
    type: z.enum(["phone_click", "estimate_cta_click", "form_start", "ai_open"]),
    page: z
      .string()
      .max(200)
      .regex(/^\/[a-zA-Z0-9/_-]*$/),
    serviceSlug: z.string().max(100).optional(),
  })
  .strict();
export async function POST(req: Request) {
  if (!parsedClientConfig.analytics.enabled) return new Response(null, { status: 204 });
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  try {
    const bytes = await readBody(req, 4096);
    if (!bytes) return new Response(null, { status: 413 });
    let payload: unknown;
    try {
      payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return new Response(null, { status: 400 });
    }
    const result = schema.safeParse(payload);
    if (!result.success || (result.data.serviceSlug && !getService(result.data.serviceSlug)))
      return new Response(null, { status: 400 });
    const allowedPages = new Set([
      "/",
      ...parsedClientConfig.pages
        .filter((page) => page.enabled && page.slug !== "home")
        .map((page) => `/${page.slug}`),
      ...parsedClientConfig.services
        .filter((service) => service.offered)
        .map((service) => `/services/${service.slug}`),
    ]);
    if (!allowedPages.has(result.data.page)) return new Response(null, { status: 400 });
    const store = getStore();
    if (!(await store.rateLimit.hit(`analytics:${hashIp(clientIp(req))}`, 60, 60000)).allowed)
      return new Response(null, { status: 429, headers: { "Retry-After": "60" } });
    await store.analytics.record({
      id: randomUUID(),
      ...result.data,
      createdAt: new Date().toISOString(),
    });
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
