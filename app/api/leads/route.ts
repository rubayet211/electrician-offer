import { submitInquiry } from "@/lib/inquiries/service";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp } from "@/lib/security/client-ip";
import { hashIp } from "@/lib/security/hash";
const MAX_BODY = 15 * 1024 * 1024;
async function readBody(req: Request): Promise<Uint8Array | null> {
  if (Number(req.headers.get("content-length")) > MAX_BODY) return null;
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
export async function POST(req: Request): Promise<Response> {
  const base = { ok: false, notification: "queued", warnings: [] };
  if (!isAllowedOrigin(req)) return Response.json(base, { status: 403 });
  try {
    const bytes = await readBody(req);
    if (!bytes) return Response.json(base, { status: 413 });
    const contentType = req.headers.get("content-type") ?? "";
    let raw: unknown;
    const files: File[] = [];
    if (contentType.startsWith("multipart/form-data")) {
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
    } else if (contentType.startsWith("application/json"))
      raw = JSON.parse(new TextDecoder().decode(bytes));
    else return Response.json(base, { status: 400 });
    try {
      const result = await submitInquiry(raw, {
        ipHash: hashIp(clientIp(req)),
        source: "contact_form",
        files,
      });
      const { status, ...body } = result;
      return Response.json(body, { status });
    } catch {
      return Response.json(base, { status: 503 });
    }
  } catch {
    return Response.json(base, { status: 400 });
  }
}
