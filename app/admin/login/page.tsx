import { adminEnabled } from "@/lib/security/admin-session";
export default function Login() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Admin login</h1>
      {adminEnabled() ? (
        <form action="/api/admin/login" method="post" className="mt-6 grid max-w-sm gap-4">
          <label htmlFor="password">Password</label>
          <input
            className="border p-3"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <button className="bg-slate-900 p-3 text-white" type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <p>Admin access is unavailable.</p>
      )}
    </section>
  );
}
