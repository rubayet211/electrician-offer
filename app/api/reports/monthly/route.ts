import { monthKey } from "@/lib/reporting/time";
import { timingSafeEqual } from "node:crypto";
import { assertAdminApi } from "@/lib/security/admin-session";
import { monthlyReport } from "@/lib/reporting/monthly";
export async function GET(req: Request) {
  const secret = process.env.REPORT_API_SECRET;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const bearer =
    !!secret &&
    Buffer.byteLength(header) === Buffer.byteLength(expected) &&
    timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  if (!bearer) {
    const failure = assertAdminApi(req);
    if (failure) return failure;
  }
  const month = new URL(req.url).searchParams.get("month") ?? monthKey();
  try {
    return Response.json(await monthlyReport(month), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Invalid month or report unavailable" }, { status: 400 });
  }
}
