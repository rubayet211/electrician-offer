import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/security/admin-session";
import { getStore } from "@/lib/store";
import { FORM_FIELDS_BY_TYPE } from "@/lib/inquiries/schema";
import { parsedClientConfig } from "@/config/client.config";
import { Button, Card, Checkbox, Eyebrow, Label, Notice, Select, Textarea } from "@/components/ui";

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

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = (await params).id;
  const store = getStore();
  const lead = await store.leads.get(id);
  if (!lead) notFound();

  const [events, photos] = await Promise.all([store.admin.events(id), store.admin.attachments(id)]);

  const booked = events.filter((e) => e.type === "booking").at(-1)?.value === "true";
  const fields =
    lead.details && lead.details.formType in FORM_FIELDS_BY_TYPE
      ? FORM_FIELDS_BY_TYPE[lead.details.formType as keyof typeof FORM_FIELDS_BY_TYPE]
      : [];

  const serviceObj = parsedClientConfig.services.find((s) => s.slug === lead.serviceSlug);
  const statusClass = getStatusStyle(lead.status);
  const notifClass = getNotificationStyle(lead.notificationStatus);

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-signal-blue hover:underline"
        >
          ← Back to leads
        </Link>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-steel-200 pb-5">
          <div>
            <Eyebrow>Inquiry Detail</Eyebrow>
            <h1 className="mt-1 font-mono text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {lead.reference}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-sm border uppercase ${statusClass}`}
            >
              {lead.status.replaceAll("_", " ")}
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-sm border ${notifClass}`}
            >
              {lead.notificationStatus}
            </span>
            {lead.isDemo && (
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded-sm border bg-amber/15 text-amber-strong border-amber/40">
                demo
              </span>
            )}
            <span className="font-mono text-xs px-2.5 py-1 rounded-sm bg-steel-100 text-steel-700 border border-steel-200">
              {lead.source}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Customer details & Service info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Overview Card */}
          <Card padding="md" tone="paper" cornerTicks>
            <h2 className="font-display text-lg font-bold text-ink mb-4 border-b border-steel-100 pb-2">
              Customer Information
            </h2>

            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Customer Name
                </dt>
                <dd className="mt-1 font-medium text-ink text-base">{lead.name}</dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Phone Number
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex min-h-[44px] items-center font-mono font-medium text-signal-blue hover:underline"
                  >
                    {lead.phone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Email Address
                </dt>
                <dd className="mt-1">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex min-h-[44px] items-center text-signal-blue hover:underline"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-steel-400">Not provided</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Location / ZIP
                </dt>
                <dd className="mt-1 font-mono text-ink">
                  {lead.zip || lead.location || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Requested Service
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {serviceObj?.title ?? lead.serviceSlug}{" "}
                  <span className="font-mono text-xs text-steel-500">({lead.serviceSlug})</span>
                </dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Urgency
                </dt>
                <dd className="mt-1 font-mono uppercase text-ink text-xs font-semibold">
                  {lead.urgency}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Date Received
                </dt>
                <dd className="mt-1 font-mono text-xs text-steel-600">
                  {new Date(lead.createdAt).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                  Internal Lead ID
                </dt>
                <dd className="mt-1 font-mono text-xs text-steel-500 truncate" title={lead.id}>
                  {lead.id}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-steel-100 pt-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold mb-1.5">
                Problem Description
              </h3>
              <div className="rounded-sm bg-paper-subtle p-3.5 border border-steel-200 text-sm text-ink leading-relaxed break-words whitespace-pre-wrap">
                {lead.description}
              </div>
            </div>
          </Card>

          {/* Labeled Service Details */}
          <Card padding="md" tone="paper" cornerTicks>
            <h2 className="font-display text-lg font-bold text-ink mb-4 border-b border-steel-100 pb-2">
              Service Details
            </h2>

            {lead.details && Object.keys(lead.details).length > 1 ? (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                {Object.entries(lead.details)
                  .filter(([key]) => key !== "formType")
                  .map(([key, value]) => {
                    const field = (
                      fields as readonly {
                        name: string;
                        label: string;
                        options?: readonly { value: string; label: string }[];
                      }[]
                    ).find((f) => f.name === key);
                    const label = field?.label ?? key;
                    const displayValue =
                      field && "options" in field && field.options
                        ? (field.options.find((o) => o.value === value)?.label ?? String(value))
                        : String(value ?? "");

                    return (
                      <div key={key} className="border-b border-steel-100 pb-2">
                        <dt className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold">
                          {label}
                        </dt>
                        <dd className="mt-1 font-medium text-ink break-words">{displayValue}</dd>
                      </div>
                    );
                  })}
              </dl>
            ) : (
              <p className="text-sm text-steel-500">
                No extra technical specifications requested for this service category.
              </p>
            )}
          </Card>

          {/* Photos */}
          {photos.length > 0 && (
            <Card padding="md" tone="paper" cornerTicks>
              <h2 className="font-display text-lg font-bold text-ink mb-4 border-b border-steel-100 pb-2">
                Attached Photos ({photos.length})
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={`/api/admin/attachments/${encodeURIComponent(photo.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-sm border border-steel-300 hover:border-signal-blue transition-colors"
                  >
                    <Image
                      width={240}
                      height={240}
                      unoptimized
                      src={`/api/admin/attachments/${encodeURIComponent(photo.id)}`}
                      alt={photo.name}
                      className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="p-2 bg-paper text-xs font-mono text-steel-600 truncate border-t border-steel-200">
                      {photo.name}
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Event History */}
          <Card padding="md" tone="paper" cornerTicks>
            <h2 className="font-display text-lg font-bold text-ink mb-4 border-b border-steel-100 pb-2">
              Event History
            </h2>

            {events.length > 0 ? (
              <ul className="divide-y divide-steel-200">
                {events.map((e, i) => (
                  <li
                    key={i}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-sm bg-steel-100 text-steel-700 font-semibold border border-steel-200">
                        {e.type}
                      </span>
                      <span className="font-medium text-ink break-words">{e.value}</span>
                    </div>
                    <time className="font-mono text-xs text-steel-500 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-steel-500">No status changes or notes recorded yet.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Status update & notification retry */}
        <div className="space-y-6">
          <Card padding="md" tone="paper" cornerTicks>
            <h2 className="font-display text-lg font-bold text-ink mb-4 border-b border-steel-100 pb-2">
              Update Lead Status
            </h2>

            <form
              action={`/api/admin/leads/${encodeURIComponent(id)}`}
              method="post"
              className="space-y-4"
            >
              <div>
                <Label htmlFor="status" required>
                  Status
                </Label>
                <Select
                  id="status"
                  name="status"
                  defaultValue={lead.status}
                  options={[
                    { value: "new", label: "New" },
                    { value: "contacted", label: "Contacted" },
                    { value: "estimate_sent", label: "Estimate sent" },
                    { value: "scheduled", label: "Scheduled" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
              </div>

              <div>
                <Label htmlFor="note">Add Note</Label>
                <Textarea
                  id="note"
                  name="note"
                  maxLength={2000}
                  placeholder="Record call summary, pricing discussion, or schedule notes..."
                />
              </div>

              <div className="pt-2">
                <Checkbox
                  id="booked"
                  name="booked"
                  defaultChecked={booked}
                  label="Booking confirmed"
                  description="Mark as manually verified paying booking for monthly metrics."
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Save
                </Button>
              </div>
            </form>

            {["failed", "pending"].includes(lead.notificationStatus) && (
              <div className="mt-6 border-t border-steel-200 pt-4">
                <Notice type="info" title="Notification pending or failed" className="mb-3">
                  Email dispatch for this inquiry has not completed successfully.
                </Notice>

                <form action={`/api/admin/leads/${encodeURIComponent(id)}/retry`} method="post">
                  <Button type="submit" variant="secondary" size="md" className="w-full">
                    Retry notification
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
