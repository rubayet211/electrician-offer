import Link from "next/link";
import { requireAdmin } from "@/lib/security/admin-session";
import { getStore } from "@/lib/store";
import { allLeads } from "@/lib/reporting/monthly";
import { parsedClientConfig } from "@/config/client.config";
import { Button, Card, Eyebrow, Input, Label, Select } from "@/components/ui";

export const dynamic = "force-dynamic";

function getStatusStyle(status: string) {
  switch (status) {
    case "new":
      return "bg-amber/15 text-amber-strong border-amber/40";
    case "contacted":
      return "bg-blue-50 text-signal-blue border-blue-200";
    case "estimate_sent":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "scheduled":
      return "bg-green-50 text-green-700 border-green-200";
    case "closed":
      return "bg-steel-100 text-steel-700 border-steel-300";
    default:
      return "bg-steel-100 text-steel-700 border-steel-300";
  }
}

function getNotificationStyle(status: string) {
  switch (status) {
    case "sent":
      return "bg-green-50 text-green-700 border-green-200";
    case "pending":
      return "bg-steel-100 text-steel-700 border-steel-300";
    case "skipped_demo":
      return "bg-amber/15 text-amber-strong border-amber/40";
    case "failed":
    case "failed_final":
      return "bg-red-50 text-danger border-red-200";
    default:
      return "bg-steel-100 text-steel-700 border-steel-300";
  }
}

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const q = await searchParams;
  const page = Math.max(1, Number.parseInt(q.page ?? "1", 10) || 1);
  const pageSize = 25;

  const all = await allLeads(getStore());
  const leads = all.filter(
    (l) =>
      (!q.service || l.serviceSlug === q.service) &&
      (!q.status || l.status === q.status) &&
      (!q.source || l.source === q.source) &&
      (!q.reference || l.reference.toLowerCase().includes(q.reference.toLowerCase())) &&
      (!q.from || l.createdAt.slice(0, 10) >= q.from) &&
      (!q.to || l.createdAt.slice(0, 10) <= q.to),
  );

  const totalPages = Math.ceil(leads.length / pageSize) || 1;
  const pagedLeads = leads.slice((page - 1) * pageSize, page * pageSize);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const url = (p: number) =>
    `/admin?${new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(q).filter(
          (e): e is [string, string] => typeof e[1] === "string" && e[0] !== "page",
        ),
      ),
      page: String(p),
    })}`;

  const hasFilters = Boolean(q.service || q.status || q.source || q.reference || q.from || q.to);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-steel-200 pb-5">
        <div>
          <Eyebrow>Contractor Operations</Eyebrow>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Leads
            </h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-sm bg-steel-100 text-steel-700 border border-steel-200">
              {leads.length} requests
            </span>
          </div>
        </div>

        <nav aria-label="Admin navigation" className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/report"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-technical hover:bg-steel-50 transition-colors"
          >
            Monthly report
          </Link>
          <a
            href={`/api/admin/leads/export?month=${currentMonth}`}
            download={`leads-${currentMonth}.csv`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-technical hover:bg-steel-50 transition-colors"
          >
            Export CSV
          </a>
          <form action="/api/admin/logout" method="post" className="inline">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-steel-700 shadow-technical hover:bg-red-50 hover:text-danger hover:border-red-200 transition-colors"
            >
              Log out
            </button>
          </form>
        </nav>
      </header>

      {/* Filter Form */}
      <Card padding="md" tone="paper" cornerTicks>
        <form method="get" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="filter-service">Service</Label>
              <Select
                id="filter-service"
                name="service"
                defaultValue={q.service ?? ""}
                options={[
                  { value: "", label: "All services" },
                  ...parsedClientConfig.services.map((s) => ({
                    value: s.slug,
                    label: s.title,
                  })),
                ]}
              />
            </div>

            <div>
              <Label htmlFor="filter-status">Status</Label>
              <Select
                id="filter-status"
                name="status"
                defaultValue={q.status ?? ""}
                options={[
                  { value: "", label: "All statuses" },
                  { value: "new", label: "New" },
                  { value: "contacted", label: "Contacted" },
                  { value: "estimate_sent", label: "Estimate sent" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="filter-source">Source</Label>
              <Select
                id="filter-source"
                name="source"
                defaultValue={q.source ?? ""}
                options={[
                  { value: "", label: "All sources" },
                  { value: "contact_form", label: "Contact form" },
                  { value: "ai_chat", label: "AI chat" },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="filter-reference">Reference</Label>
              <Input
                id="filter-reference"
                name="reference"
                defaultValue={q.reference ?? ""}
                placeholder="e.g. EL-XXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="filter-from">From Date</Label>
              <Input id="filter-from" type="date" name="from" defaultValue={q.from ?? ""} />
            </div>

            <div>
              <Label htmlFor="filter-to">To Date</Label>
              <Input id="filter-to" type="date" name="to" defaultValue={q.to ?? ""} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" size="md">
                Filter
              </Button>
              {hasFilters && (
                <Link
                  href="/admin"
                  className="inline-flex min-h-[44px] items-center text-sm font-medium text-steel-600 hover:text-ink underline"
                >
                  Clear filters
                </Link>
              )}
            </div>

            <p className="text-xs font-mono text-steel-500">
              Showing {leads.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, leads.length)} of {leads.length}
            </p>
          </div>
        </form>
      </Card>

      {/* Empty State */}
      {leads.length === 0 ? (
        <Card padding="lg" tone="subtle" className="text-center py-16">
          <p className="font-display text-lg font-semibold text-ink">No leads found</p>
          <p className="mt-1 text-sm text-steel-600">
            {hasFilters
              ? "No customer inquiries match your active filter criteria. Try resetting your filters."
              : "No customer leads have been submitted to this system yet."}
          </p>
          {hasFilters && (
            <div className="mt-4">
              <Button href="/admin" variant="secondary" size="md">
                Reset all filters
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-md border border-steel-200 bg-paper shadow-technical">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-steel-200 bg-paper-subtle font-mono text-xs uppercase tracking-wider text-steel-600">
                    <th scope="col" className="px-4 py-3">
                      Reference
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Service
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Source
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Notification
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-200">
                  {pagedLeads.map((l) => {
                    const serviceObj = parsedClientConfig.services.find(
                      (s) => s.slug === l.serviceSlug,
                    );
                    const statusClass = getStatusStyle(l.status);
                    const notifClass = getNotificationStyle(l.notificationStatus);

                    return (
                      <tr key={l.id} className="hover:bg-steel-50/60 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Link
                            href={`/admin/leads/${encodeURIComponent(l.id)}`}
                            className="font-mono text-sm font-bold text-signal-blue hover:underline"
                          >
                            {l.reference}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-ink">{l.name}</div>
                          <div className="font-mono text-xs text-steel-500">{l.phone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-ink">
                            {serviceObj?.title ?? l.serviceSlug}
                          </div>
                          <div className="font-mono text-xs text-steel-500">{l.serviceSlug}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-steel-100 text-steel-700 border border-steel-200">
                            {l.source}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-sm border uppercase ${statusClass}`}
                          >
                            {l.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-sm border ${notifClass}`}
                            >
                              {l.notificationStatus}
                            </span>
                            {l.isDemo && (
                              <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded-sm border bg-amber/15 text-amber-strong border-amber/40">
                                demo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-steel-500">
                          {l.createdAt.slice(0, 10)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/leads/${encodeURIComponent(l.id)}`}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center font-medium text-signal-blue hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-3 md:hidden">
            {pagedLeads.map((l) => {
              const serviceObj = parsedClientConfig.services.find((s) => s.slug === l.serviceSlug);
              const statusClass = getStatusStyle(l.status);
              const notifClass = getNotificationStyle(l.notificationStatus);

              return (
                <Card key={l.id} padding="md" tone="paper" cornerTicks>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/leads/${encodeURIComponent(l.id)}`}
                      className="font-mono text-base font-bold text-signal-blue hover:underline"
                    >
                      {l.reference}
                    </Link>
                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-sm border uppercase ${statusClass}`}
                    >
                      {l.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="font-medium text-ink">{l.name}</p>
                    <p className="text-xs text-steel-600">
                      {serviceObj?.title ?? l.serviceSlug} ({l.serviceSlug})
                    </p>
                    <p className="font-mono text-xs text-steel-500">
                      {l.phone} • {l.createdAt.slice(0, 10)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-steel-100 pt-3 text-xs">
                    <span className="font-mono text-steel-600">Source: {l.source}</span>
                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-sm border ${notifClass}`}
                    >
                      {l.notificationStatus}
                    </span>
                    {l.isDemo && (
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded-sm border bg-amber/15 text-amber-strong border-amber/40">
                        demo
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/admin/leads/${encodeURIComponent(l.id)}`}
                      className="flex min-h-[44px] w-full items-center justify-center rounded-sm border border-steel-300 bg-paper-subtle text-sm font-semibold text-ink shadow-technical hover:bg-steel-100 transition-colors"
                    >
                      View inquiry details
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between border-t border-steel-200 pt-4"
            >
              {page > 1 ? (
                <Link
                  href={url(page - 1)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-technical hover:bg-steel-50 transition-colors"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-200 bg-steel-100 px-4 py-2.5 text-sm font-semibold text-steel-400 opacity-60 cursor-not-allowed">
                  Previous
                </span>
              )}

              <span className="font-mono text-xs text-steel-600">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={url(page + 1)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-300 bg-paper px-4 py-2.5 text-sm font-semibold text-ink shadow-technical hover:bg-steel-50 transition-colors"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-steel-200 bg-steel-100 px-4 py-2.5 text-sm font-semibold text-steel-400 opacity-60 cursor-not-allowed">
                  Next
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
