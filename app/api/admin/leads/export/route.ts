import { assertAdminApi } from "@/lib/security/admin-session";
import { getStore } from "@/lib/store";
import { allLeads, monthBounds } from "@/lib/reporting/monthly";
import { csvCell } from "@/lib/reporting/csv";
export async function GET(req: Request) {
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const params = new URL(req.url).searchParams;
  const month = params.get("month") ?? "";
  try {
    const [start, end] = monthBounds(month);
    const service = params.get("service");
    const leads = (await allLeads(getStore())).filter(
      (l) =>
        +new Date(l.createdAt) >= +start &&
        +new Date(l.createdAt) < +end &&
        (!service || l.serviceSlug === service),
    );
    const columns = [
      "reference",
      "createdAt",
      "name",
      "phone",
      "email",
      "serviceSlug",
      "description",
      "urgency",
      "source",
      "status",
      "notificationStatus",
      "isDemo",
    ] as const;
    const csv =
      [
        columns.map(csvCell).join(","),
        ...leads.map((lead) => columns.map((key) => csvCell(lead[key])).join(",")),
      ].join("\r\n") + "\r\n";
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${month}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "Invalid month or export unavailable" }, { status: 400 });
  }
}
