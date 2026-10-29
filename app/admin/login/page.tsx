import { adminEnabled } from "@/lib/security/admin-session";
import { Card, Eyebrow, Notice } from "@/components/ui";
import { LoginForm } from "./LoginForm";

export default function Login() {
  const isEnabled = adminEnabled();

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <div className="mb-6 text-center">
        <Eyebrow className="justify-center">Axinofy Contractor Portal</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-steel-600">
          Sign in to review customer leads, manage inquiry statuses, and view operational reports.
        </p>
      </div>

      <Card padding="lg" tone="paper" cornerTicks>
        {isEnabled ? (
          <LoginForm />
        ) : (
          <Notice type="info" title="Admin access unavailable">
            <p>Admin access is not available on this site. Contact Axinofy support.</p>
          </Notice>
        )}
      </Card>
    </section>
  );
}
