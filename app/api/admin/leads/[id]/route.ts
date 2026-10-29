import { assertAdminApi } from "@/lib/security/admin-session";
import { isAllowedOrigin } from "@/lib/security/origin";
import { getStore } from "@/lib/store";
import { readBody } from "@/lib/http/read-body";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const body = await readBody(req, 8192);
  if (!body) return new Response(null, { status: 413 });
  const form = new URLSearchParams(new TextDecoder().decode(body));
  const status = form.get("status");
  const note = form.get("note");
  if (
    typeof status !== "string" ||
    !["new", "contacted", "estimate_sent", "scheduled", "closed"].includes(status) ||
    typeof note !== "string" ||
    note.length > 2000
  )
    return new Response(null, { status: 400 });
  const id = (await params).id;
  if (!(await getStore().admin.update(id, status, note.trim(), form.get("booked") === "on")))
    return new Response(null, { status: 404 });
  return Response.redirect(new URL(`/admin/leads/${encodeURIComponent(id)}`, req.url), 303);
}
