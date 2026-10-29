import Link from "next/link";
import { requireAdmin } from "@/lib/security/admin-session";
import { monthlyReport } from "@/lib/reporting/monthly";
export default async function Report({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAdmin();
  const month = (await searchParams).month ?? new Date().toISOString().slice(0, 7);
  let report;
  try {
    report = await monthlyReport(month);
  } catch {
    return <p>Report unavailable or invalid month.</p>;
  }
  return (
    <div className="space-y-5">
      <Link href="/admin">? Leads</Link>
      <h1 className="text-3xl font-bold">Monthly report</h1>
      <form>
        <label>
          Month{" "}
          <input className="border p-2" name="month" type="month" defaultValue={month} required />
        </label>{" "}
        <button className="border p-2">View</button>
      </form>
      <p>Clicks, requests and manually confirmed bookings are distinct measures.</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {Object.entries(report)
          .filter(([, v]) => typeof v === "number")
          .map(([key, value]) => (
            <div key={key} className="border p-3">
              <dt>{key}</dt>
              <dd className="text-xl font-bold">{String(value)}</dd>
            </div>
          ))}
      </dl>
      <p>Requests by service: {JSON.stringify(report.byService)}</p>
      <p>Requests by status: {JSON.stringify(report.byStatus)}</p>
      <p>
        <a href={`/api/admin/leads/export?month=${month}`}>Download CSV</a> �{" "}
        <a href={`/api/reports/monthly?month=${month}`} download={`report-${month}.json`}>
          Download report JSON
        </a>
      </p>
      <h2 className="text-xl font-bold">Maintenance log</h2>
      <ul>
        {report.maintenance.map((e, i) => (
          <li key={i}>
            {e.date} � {e.minutes} minutes � {e.description}
          </li>
        ))}
      </ul>
      <form action="/api/admin/maintenance" method="post" className="grid max-w-lg gap-3">
        <label>
          Date
          <input name="date" type="date" required className="block w-full border p-2" />
        </label>
        <label>
          Minutes
          <input
            name="minutes"
            type="number"
            min="0"
            required
            className="block w-full border p-2"
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            required
            maxLength={2000}
            className="block w-full border p-2"
          />
        </label>
        <button className="bg-slate-900 p-3 text-white">Add entry</button>
      </form>
    </div>
  );
}
