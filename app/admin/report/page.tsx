import Link from "next/link";
import { requireAdmin } from "@/lib/security/admin-session";
import { monthlyReport } from "@/lib/reporting/monthly";
import { parsedClientConfig } from "@/config/client.config";
import { Button, Card, Eyebrow, Input, Label, Notice, Textarea } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Report({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAdmin();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const month = (await searchParams).month ?? currentMonth;

  let report;
  try {
    report = await monthlyReport(month);
  } catch {
    return (
      <div className="space-y-4">
        <Link
          href="/admin"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-signal-blue hover:underline"
        >
          ← Back to leads
        </Link>
        <Notice type="safety" title="Report unavailable">
          <p>
            The requested month (<code>{month}</code>) is invalid or reporting data could not be
            retrieved. Please select a valid month in YYYY-MM format.
          </p>
        </Notice>
      </div>
    );
  }

  const totalEstimateRequests = report.formRequests + report.aiRequests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-signal-blue hover:underline"
        >
          ← Back to leads
        </Link>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-steel-200 pb-5">
          <div>
            <Eyebrow>Performance & Audit</Eyebrow>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Monthly report
            </h1>
            <p className="mt-1 text-sm text-steel-600">
              Measured operational facts for month{" "}
              <span className="font-mono font-semibold text-ink">{month}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/api/admin/leads/export?month=${month}`}
              download={`leads-${month}.csv`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-technical hover:bg-steel-50 transition-colors"
            >
              Download CSV
            </a>
            <a
              href={`/api/reports/monthly?month=${month}`}
              download={`report-${month}.json`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-technical hover:bg-steel-50 transition-colors"
            >
              Download report JSON
            </a>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <Card padding="md" tone="paper" cornerTicks>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-auto">
            <Label htmlFor="report-month">Select Reporting Month</Label>
            <Input
              id="report-month"
              name="month"
              type="month"
              defaultValue={month}
              required
              className="w-full sm:w-48"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            View
          </Button>
        </form>
      </Card>

      {/* Notice on Measured Facts */}
      <Notice type="info" title="Conversion Transparency Notice">
        Clicks, estimate requests, and manually confirmed bookings are distinct measures. We do not
        estimate speculative conversion rates or assign synthetic dollar valuations.
      </Notice>

      {/* Primary Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1: Phone Clicks */}
        <Card padding="md" tone="paper" cornerTicks>
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            Phone clicks
          </dt>
          <dd className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            {report.phoneClicks}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Direct clicks to call phone number from website buttons and links.
          </p>
        </Card>

        {/* Metric 2: Estimate Requests */}
        <Card padding="md" tone="paper" cornerTicks>
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            Estimate requests
          </dt>
          <dd className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            {totalEstimateRequests}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Completed inquiries ({report.formRequests} via form, {report.aiRequests} via AI
            assistant).
          </p>
        </Card>

        {/* Metric 3: Confirmed Bookings */}
        <Card padding="md" tone="paper" cornerTicks>
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            Confirmed bookings
          </dt>
          <dd className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            {report.bookings}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Manually verified paying customer jobs confirmed by the contractor.
          </p>
        </Card>

        {/* Secondary: Estimate Clicks */}
        <Card padding="md" tone="subtle">
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            Estimate CTA clicks
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            {report.estimateClicks}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Visitors who clicked &quot;Request Estimate&quot; buttons to view the form.
          </p>
        </Card>

        {/* Secondary: Form Starts */}
        <Card padding="md" tone="subtle">
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            Form starts
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            {report.formStarts}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Visitors who interacted with the estimate questionnaire.
          </p>
        </Card>

        {/* Secondary: Notification Failures */}
        <Card padding="md" tone="subtle">
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            Notification failures
          </dt>
          <dd
            className={`mt-2 font-display text-2xl font-bold tracking-tight ${
              report.notificationFailures > 0 ? "text-danger" : "text-ink"
            }`}
          >
            {report.notificationFailures}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Inquiries where contractor notification delivery failed.
          </p>
        </Card>

        {/* AI Assistant Conversations */}
        <Card padding="md" tone="subtle">
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            AI conversations used
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            {report.aiConversations} / {report.aiAllowance}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Visitor chat sessions against the monthly included allowance.
          </p>
        </Card>

        {/* AI Model Cost */}
        <Card padding="md" tone="subtle">
          <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
            AI model cost
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            ${Number(report.costUsd || 0).toFixed(4)}
          </dd>
          <p className="mt-1 text-xs text-steel-500">
            Actual OpenRouter provider billing accumulated for the month.
          </p>
        </Card>
      </div>

      {/* Breakdown by Service & Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Requests by Service */}
        <Card padding="md" tone="paper" cornerTicks>
          <h2 className="font-display text-lg font-bold text-ink mb-3 border-b border-steel-100 pb-2">
            Requests by service
          </h2>
          {Object.keys(report.byService).length > 0 ? (
            <ul className="divide-y divide-steel-100 text-sm">
              {Object.entries(report.byService).map(([slug, count]) => {
                const serviceObj = parsedClientConfig.services.find((s) => s.slug === slug);
                return (
                  <li key={slug} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-ink">{serviceObj?.title ?? slug}</span>
                      <span className="ml-2 font-mono text-xs text-steel-500">({slug})</span>
                    </div>
                    <span className="font-mono font-bold text-ink bg-steel-100 px-2 py-0.5 rounded-sm">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-steel-500">No requests recorded for this month.</p>
          )}
        </Card>

        {/* Requests by Status */}
        <Card padding="md" tone="paper" cornerTicks>
          <h2 className="font-display text-lg font-bold text-ink mb-3 border-b border-steel-100 pb-2">
            Requests by status
          </h2>
          {Object.keys(report.byStatus).length > 0 ? (
            <ul className="divide-y divide-steel-100 text-sm">
              {Object.entries(report.byStatus).map(([status, count]) => (
                <li key={status} className="py-2.5 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-ink font-medium">
                    {status.replaceAll("_", " ")}
                  </span>
                  <span className="font-mono font-bold text-ink bg-steel-100 px-2 py-0.5 rounded-sm">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-steel-500">No requests recorded for this month.</p>
          )}
        </Card>
      </div>

      {/* Maintenance Log Section */}
      <Card padding="md" tone="paper" cornerTicks>
        <h2 className="font-display text-lg font-bold text-ink mb-2">Maintenance log</h2>
        <p className="text-sm text-steel-600 mb-4">
          Record platform maintenance, updates, and configuration tasks included in the Axinofy
          managed site service.
        </p>

        {report.maintenance.length > 0 ? (
          <div className="overflow-hidden rounded-sm border border-steel-200 mb-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-paper-subtle border-b border-steel-200 font-mono text-xs uppercase tracking-wider text-steel-600">
                  <th scope="col" className="px-4 py-2.5">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Minutes
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200">
                {report.maintenance.map((entry, i) => (
                  <tr key={i} className="hover:bg-steel-50/50">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{entry.date}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap font-semibold">
                      {entry.minutes} min
                    </td>
                    <td className="px-4 py-3 text-steel-700 break-words">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-steel-500 mb-6">
            No maintenance activities logged for {month}.
          </p>
        )}

        {/* Add Entry Form */}
        <div className="border-t border-steel-200 pt-5">
          <h3 className="font-display text-base font-bold text-ink mb-3">Add maintenance entry</h3>
          <form action="/api/admin/maintenance" method="post" className="space-y-4 max-w-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="m-date" required>
                  Date
                </Label>
                <Input
                  id="m-date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="m-minutes" required>
                  Minutes
                </Label>
                <Input
                  id="m-minutes"
                  name="minutes"
                  type="number"
                  min="0"
                  max="100000"
                  defaultValue="15"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="m-description" required>
                Description
              </Label>
              <Textarea
                id="m-description"
                name="description"
                required
                maxLength={2000}
                placeholder="e.g. Verified license renewals, refreshed SSL certificates, updated pricing disclaimer."
              />
            </div>

            <Button type="submit" variant="secondary" size="md">
              Add entry
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
