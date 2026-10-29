export const metadata = { robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl p-6 text-slate-900">{children}</main>;
}
