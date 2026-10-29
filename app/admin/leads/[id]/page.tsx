import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/security/admin-session";
import { getStore } from "@/lib/store";
import { FORM_FIELDS_BY_TYPE } from "@/lib/inquiries/schema";
export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = (await params).id;
  const store = getStore();
  const lead = await store.leads.get(id);
  if (!lead) notFound();
  const [events, photos] = await Promise.all([store.admin.events(id), store.admin.attachments(id)]);
  const booked = events.filter((e) => e.type === "booking").at(-1)?.value === "true";
  const fields = lead.details ? FORM_FIELDS_BY_TYPE[lead.details.formType] : [];
  return (
    <div className="space-y-6">
      <Link href="/admin">? Leads</Link>
      <h1 className="text-3xl font-bold">{lead.reference}</h1>
      <p>
        <a href={`tel:${lead.phone}`}>{lead.phone}</a>
        {lead.email && (
          <>
            {" "}
            � <a href={`mailto:${lead.email}`}>{lead.email}</a>
          </>
        )}
      </p>
      <dl className="grid gap-2">
        {Object.entries(lead)
          .filter(([key]) => key !== "details")
          .map(([key, value]) => (
            <div key={key}>
              <dt className="font-bold">{key}</dt>
              <dd className="break-words">
                {typeof value === "object" ? JSON.stringify(value) : String(value ?? "�")}
              </dd>
            </div>
          ))}
      </dl>
      <h2 className="text-xl font-bold">Service details</h2>
      <dl>
        {Object.entries(lead.details ?? {})
          .filter(([key]) => key !== "formType")
          .map(([key, value]) => {
            const field = fields.find((f) => f.name === key);
            return (
              <div key={key}>
                <dt className="font-bold">{field?.label ?? key}</dt>
                <dd>
                  {field && "options" in field
                    ? (field.options?.find((o) => o.value === value)?.label ?? String(value))
                    : String(value)}
                </dd>
              </div>
            );
          })}
      </dl>
      <div className="flex flex-wrap gap-3">
        {photos.map((photo) => (
          <a href={`/api/admin/attachments/${encodeURIComponent(photo.id)}`} key={photo.id}>
            <Image
              width={128}
              height={128}
              unoptimized
              src={`/api/admin/attachments/${encodeURIComponent(photo.id)}`}
              alt={photo.name}
              className="h-32 w-32 object-cover"
            />
          </a>
        ))}
      </div>
      <form
        action={`/api/admin/leads/${encodeURIComponent(id)}`}
        method="post"
        className="grid max-w-lg gap-3"
      >
        <label>
          Status
          <select name="status" defaultValue={lead.status} className="block w-full border p-2">
            {["new", "contacted", "estimate_sent", "scheduled", "closed"].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Note
          <textarea name="note" maxLength={2000} className="block w-full border p-2" />
        </label>
        <label>
          <input name="booked" type="checkbox" defaultChecked={booked} /> Booking confirmed
          (manually verified)
        </label>
        <button className="bg-slate-900 p-3 text-white">Save</button>
      </form>
      {["failed", "pending"].includes(lead.notificationStatus) && (
        <form action={`/api/admin/leads/${encodeURIComponent(id)}/retry`} method="post">
          <button className="border p-3">Retry notification</button>
        </form>
      )}
      <h2 className="text-xl font-bold">Event history</h2>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            {e.createdAt} � {e.type}: {e.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
