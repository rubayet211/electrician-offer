import { assertAdminApi } from "@/lib/security/admin-session";
import { isAllowedOrigin } from "@/lib/security/origin";
import { getStore } from "@/lib/store";
import { readBody } from "@/lib/http/read-body";
export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const body = await readBody(req, 8192);
  if (!body) return new Response(null, { status: 413 });
  const form = new URLSearchParams(new TextDecoder().decode(body));
  const date = form.get("date"),
    description = form.get("description"),
    minutes = Number(form.get("minutes"));
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date ||
    typeof description !== "string" ||
    !description.trim() ||
    description.length > 2000 ||
    !Number.isSafeInteger(minutes) ||
    minutes < 0 ||
    minutes > 100000
  )
    return new Response(null, { status: 400 });
  await getStore().admin.addMaintenance(date, minutes, description.trim());
  return Response.redirect(new URL(`/admin/report?month=${date.slice(0, 7)}`, req.url), 303);
}
