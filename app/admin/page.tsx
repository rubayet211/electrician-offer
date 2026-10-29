import Link from "next/link";
import { requireAdmin } from "@/lib/security/admin-session";
import { getStore } from "@/lib/store";
import { allLeads } from "@/lib/reporting/monthly";
import { parsedClientConfig } from "@/config/client.config";
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const q = await searchParams;
  const page = Math.max(1, Number.parseInt(q.page ?? "1", 10) || 1);
  const leads = (await allLeads(getStore())).filter(
    (l) =>
      (!q.service || l.serviceSlug === q.service) &&
      (!q.status || l.status === q.status) &&
      (!q.source || l.source === q.source) &&
      (!q.reference || l.reference.toLowerCase().includes(q.reference.toLowerCase())) &&
      (!q.from || l.createdAt.slice(0, 10) >= q.from) &&
      (!q.to || l.createdAt.slice(0, 10) <= q.to),
  );
  const url = (p: number) =>
    `/admin?${new URLSearchParams({ ...Object.fromEntries(Object.entries(q).filter((e): e is [string, string] => typeof e[1] === "string")), page: String(p) })}`;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Leads</h1>
        <nav className="flex gap-4">
          <Link href="/admin/report">Monthly report</Link>
          <form action="/api/admin/logout" method="post">
            <button>Log out</button>
          </form>
        </nav>
      </header>
      <form className="grid gap-3 sm:grid-cols-3" method="get">
        <label>
          Service
          <select name="service" defaultValue={q.service} className="block w-full border p-2">
            <option value="">All</option>
            {parsedClientConfig.services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={q.status} className="block w-full border p-2">
            <option value="">All</option>
            {["new", "contacted", "estimate_sent", "scheduled", "closed"].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <select name="source" defaultValue={q.source} className="block w-full border p-2">
            <option value="">All</option>
            <option value="contact_form">Contact form</option>
            <option value="ai_chat">AI chat</option>
          </select>
        </label>
        <label>
          Reference
          <input name="reference" defaultValue={q.reference} className="block w-full border p-2" />
        </label>
        <label>
          From
          <input
            type="date"
            name="from"
            defaultValue={q.from}
            className="block w-full border p-2"
          />
        </label>
        <label>
          To
          <input type="date" name="to" defaultValue={q.to} className="block w-full border p-2" />
        </label>
        <button className="bg-slate-900 p-3 text-white">Filter</button>
      </form>
      <p>{leads.length} requests</p>
      <ul className="grid gap-3">
        {leads.slice((page - 1) * 25, page * 25).map((l) => (
          <li key={l.id} className="border p-4">
            <Link className="font-bold underline" href={`/admin/leads/${encodeURIComponent(l.id)}`}>
              {l.reference}
            </Link>
            <p>
              {l.name} � {l.serviceSlug} � {l.status}
            </p>
            <p>
              {l.source} � {l.createdAt.slice(0, 10)} � Notification: {l.notificationStatus}
              {l.isDemo ? " � Demo" : ""}
            </p>
          </li>
        ))}
      </ul>
      <nav className="flex gap-4">
        {page > 1 && <Link href={url(page - 1)}>Previous</Link>}
        <span>Page {page}</span>
        {page * 25 < leads.length && <Link href={url(page + 1)}>Next</Link>}
      </nav>
    </div>
  );
}
