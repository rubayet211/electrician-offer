# Operations Runbook

One deployment and one Postgres database per client. Axinofy operates the deployments; clients get the admin
view.

## Environment

| Variable                                                                     | Required                          | Notes                                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                               | production (except mock-AI demo)  | `?sslmode=require`. TLS is always verified. Plaintext only for loopback hosts.          |
| `DATABASE_CA_CERT`                                                           | if the provider uses a private CA | PEM contents                                                                            |
| `RESEND_API_KEY`                                                             | production                        | Sending domain must be verified in Resend                                               |
| `IP_HASH_SECRET`, `AI_SESSION_SECRET`, `ADMIN_SESSION_SECRET`, `CRON_SECRET` | production                        | `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`        |
| `ADMIN_PASSWORD_HASH`                                                        | production                        | `node scripts/hash-admin-password.mjs`. Without it, admin is disabled (503), never open |
| `OPENROUTER_API_KEY`                                                         | if `ai.enabled` and not mock demo | Server-only                                                                             |
| `REPORT_API_SECRET`                                                          | optional                          | Bearer token for `/api/reports/monthly`                                                 |
| `NEXT_PUBLIC_SITE_ENV`                                                       | production                        | Must be `production` for indexing. Anything else → noindex + `Disallow: /`              |
| `DEMO_AI_LIVE`                                                               | demo only                         | `true` = real model in demo, and then the demo requires Postgres                        |

`pnpm prelaunch` validates all of the above with the same rules the app uses at runtime.

## Deploy a client

1. `pnpm provision --slug <slug> --name "<Company>" --domain <domain>`, then fill
   `clients/<slug>/client.config.ts` from the intake checklist. Only client-approved facts go in. Set credentials
   to `verified` only after you check them on the issuing authority's lookup.
2. `pnpm provision --activate <slug>` on the client's branch/deployment.
3. Create the Vercel project (Pro team) and a Postgres DB (Neon or similar), and set the env vars.
4. `DATABASE_URL=… pnpm db:migrate`. It is idempotent and safe to rerun.
5. Staging: deploy with `NEXT_PUBLIC_SITE_ENV=staging` (noindex). Run two revision rounds with the client.
6. `pnpm prelaunch --url https://<staging-url> --expect-noindex` must pass. Then switch to production env + domain and run
   `pnpm prelaunch --url https://<domain>`.
7. Submit one test inquiry and confirm it reaches the client's inbox. Mark it Closed in admin.

## Scheduled jobs (`vercel.json`)

| Route                     | Schedule     | Purpose                                                                                                                                      |
| ------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/cron/notifications` | every 15 min | Retry `pending`/`failed` emails, ≤15 per run, 5 attempts max, then `failed_final`                                                            |
| `/api/cron/retention`     | daily 03:00  | Delete photos older than `uploads.retentionDays` (180), expired AI drafts, AI sessions >60 days, rate-limit rows >1 day, analytics >400 days |

Both require `Authorization: Bearer $CRON_SECRET` (Vercel sends it automatically). A 15-minute cron needs Vercel
Pro. On Hobby, use an external scheduler (curl with the bearer) or a daily schedule.

## Lead lifecycle

`submitInquiry` is the only lead writer (form and AI confirm). A lead is saved before any email is attempted,
so email problems never lose a lead.

- `notification_status`: `pending` → `sent` (Resend accepted the message, which does **not** prove inbox
  delivery) | `failed` (retried by cron) | `failed_final` (after 5 attempts; follow up manually) |
  `skipped_demo`.
- Admin statuses (New / Contacted / Estimate Sent / Scheduled / Closed) are internal record states. The
  "booking confirmed" flag is set manually and is the only booking figure reports use.

## Incidents

| Symptom                        | Check                                                | Action                                                                                                                                                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client says "no emails"        | Admin → lead `notification_status`                   | `failed`/`failed_final`: check `RESEND_API_KEY`, domain verification, recipients. Use Retry in lead detail to reset attempts and send immediately; check the displayed result. `sent`: tell the client to check spam. Resend accepting the message doesn't mean it reached the inbox. |
| Form returns 503               | Vercel logs (`inquiry_error`, PII-free)              | DB reachability, migration state, env                                                                                                                                                                                                                                                 |
| Assistant shows "unavailable"  | `GET /api/ai-chat` → reason. Admin report → AI usage | Quota (100/mo) or cost cap reached: expected, resets monthly. Missing key or provider routing error: fix env. Forms and call CTA keep working.                                                                                                                                        |
| Spam burst                     | Rate-limit rows, lead list                           | Limits are store-backed (5 inquiries / 10 min / IP). Spam has honeypot + timer. Consider Turnstile only if this persists.                                                                                                                                                             |
| Need to delete a person's data | Admin lead → reference                               | Delete the lead row (attachments cascade). AI transcripts are not stored.                                                                                                                                                                                                             |

## Monthly care (≤ 60 min content + report)

1. `pnpm report:monthly` (or admin → Report). Review it. Send it to the client.
2. Log maintenance time in admin → maintenance log, so reports and the margin model use real numbers.
3. `pnpm audit` / dependency updates on the template repo. Redeploy clients.
4. Spot-check `pnpm prelaunch --url https://<domain>` (SEO/health).

## Privacy

- Logs carry event names, references and error classes only. They never contain names, phones, emails,
  descriptions or IPs.
- IPs are stored only as HMAC hashes.
- Analytics events carry type + page + service slug. No PII.
- AI: requests go to OpenRouter with ZDR + `data_collection: "deny"`. Transcripts are not stored. Only counts,
  tokens and cost are kept.

Production IP rate limiting assumes Vercel overwrites x-vercel-forwarded-for. Without that header, requests share the unknown bucket; do not deploy behind a proxy that lets clients supply it.

Next.js expands `$` in `.env` files, including quoted values. Set `ADMIN_PASSWORD_HASH_B64` to the base64 encoding of the entire scrypt hash string (for example, `node -e "console.log(Buffer.from(process.argv[1]).toString('base64'))" '<hash>'`). It takes precedence over `ADMIN_PASSWORD_HASH`. Changing either active hash invalidates existing sessions.

Staging inquiries are marked as test leads whenever `NEXT_PUBLIC_SITE_ENV` is not `production`. They are excluded from reports and exports. Set `notifications.stagingRecipients` to route test notifications to a separate inbox; otherwise they are marked `skipped_test` and no email is sent. Demo leads remain `skipped_demo`.
