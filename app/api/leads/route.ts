import { readBody } from "@/lib/http/read-body";
import { getStore } from "@/lib/store";
import { submitInquiry } from "@/lib/inquiries/service";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp } from "@/lib/security/client-ip";
import { hashIp } from "@/lib/security/hash";
const MAX_BODY = 15 * 1024 * 1024;
export async function POST(req: Request): Promise<Response> {
  const base = { ok: false, notification: "none", warnings: [] };
  if (!isAllowedOrigin(req)) return Response.json(base, { status: 403 });
  let ipHash: string;
  try {
    ipHash = hashIp(clientIp(req));
    const limit = await getStore().rateLimit.hit(`lead-body:${ipHash}`, 20, 600000);
    if (!limit.allowed)
      return Response.json(base, {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
        },
      });
  } catch {
    return Response.json(base, { status: 503 });
  }
  try {
    const bytes = await readBody(req, MAX_BODY);
    if (!bytes) return Response.json(base, { status: 413 });
    const contentType = req.headers.get("content-type") ?? "";
    const contentTypeLower = contentType.toLowerCase();
    let raw: unknown;
    const files: File[] = [];
    if (contentTypeLower.startsWith("multipart/form-data")) {
      const form = await new Request(req.url, {
        method: "POST",
        headers: { "content-type": contentType },
        body: bytes as BodyInit,
      }).formData();
      const object: Record<string, unknown> = {};
      for (const [key, value] of form.entries()) {
        if (key === "photos") {
          if (typeof value !== "string") files.push(value);
          continue;
        }
        if (typeof value !== "string" || key in object) return Response.json(base, { status: 400 });
        object[key] = value;
      }
      for (const key of ["details", "utm"])
        if (typeof object[key] === "string" && object[key])
          object[key] = JSON.parse(object[key] as string);
      object.consent = object.consent === "true";
      raw = object;
    } else if (contentTypeLower.startsWith("application/json"))
      raw = JSON.parse(new TextDecoder().decode(bytes));
    else return Response.json(base, { status: 400 });
    try {
      const result = await submitInquiry(raw, {
        ipHash,
        source: "contact_form",
        files,
      });
      const { status, ...body } = result;
      return Response.json(body, {
        status,
        headers: status === 429 ? { "Retry-After": "600" } : undefined,
      });
    } catch {
      return Response.json(base, { status: 503 });
    }
  } catch {
    return Response.json(base, { status: 400 });
  }
}
