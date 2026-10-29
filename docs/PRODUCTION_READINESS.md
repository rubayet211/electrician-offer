# Production Readiness

Status as of 2026-10-29. ✅ means verified in this repo. ⏳ means it needs live credentials or a real deployment and
is not yet verified. Never mark a ⏳ item done without doing it.

## Verified in development

| Area                                  | Evidence                                                                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Typecheck, lint                    | `pnpm typecheck`, `pnpm lint`: 0 errors                                                                                                                                           |
| ✅ Unit + integration                 | `pnpm test`: 231 passed, 3 skipped (the skipped ones are real-Postgres tests that need `TEST_DATABASE_URL`)                                                                       |
| ✅ Real Postgres 16                   | Migrations applied twice (idempotent). Concurrency suite 3/3 against `postgres:16` in Docker: idempotency, dedupe, quota reservation, draft consume with ≥10 parallel connections |
| ✅ Production build                   | `pnpm build` (Next 16.2.5, Turbopack)                                                                                                                                             |
| ✅ Browser e2e                        | `pnpm test:e2e` against the production build: 82 passed, 0 failed, 10 skipped (admin specs are desktop-only by design; mobile admin covered by a 390px smoke test)                                                                                                                          |
| ✅ Mobile                             | No horizontal scroll at 320/375/390/768. Sticky call bar shows below 768px and doesn't cover form buttons. Touch targets ≥44px                                                    |
| ✅ Demo isolation                     | Demo never emails (blocked in 3 places). Mock AI unless `DEMO_AI_LIVE=true`. Demo/test leads are excluded from production reports/exports                                         |
| ✅ AI privacy routing (request shape) | Test asserts the outgoing OpenRouter body has `provider.zdr=true`, `data_collection="deny"` and `max_price`, with no `models` fallback                                            |
| ✅ Security reviews                   | Three independent review passes (pipeline, AI, cross-cutting). All confirmed findings fixed                                                                                       |

## Requires live verification before first client launch (⏳)

1. ⏳ **OpenRouter live call** with a real `OPENROUTER_API_KEY`. Confirm `deepseek/deepseek-v4.1-flash` answers and the
   tool call works through ZDR routing. Confirm `usage.cost` is reported. The model ID and ZDR endpoint availability were
   checked against the public API on 2026-10-29. Re-check before launch.
2. ⏳ **Resend delivery.** Verify the client's sending domain, submit a test inquiry, and confirm the email reaches the
   inbox (and isn't in spam). Resend accepting a message doesn't prove it reached the inbox.
3. ⏳ **Hosted Postgres TLS.** `pnpm db:migrate` against Neon or the chosen provider with `sslmode=require`. Confirm
   certificate verification passes (set `DATABASE_CA_CERT` if the provider uses a private CA).
4. ⏳ **Vercel deployment.** Env vars set, crons registered (15-min notifications needs Pro, or use an external scheduler),
   `x-vercel-forwarded-for` present (the app trusts only this header for client IPs).
5. ⏳ **`pnpm prelaunch --url https://<staging> --expect-noindex`**, then **`pnpm prelaunch --url https://<domain>`** on
   production.
6. ⏳ **Admin.** `ADMIN_PASSWORD_HASH` set (use `ADMIN_PASSWORD_HASH_B64` in `.env` files, because `@next/env` expands
   `$`), login works, and a test lead's status can be changed.
7. ⏳ **Search Console.** Property verified and sitemap submitted (see CLIENT_ONBOARDING.md). No ranking promises.
8. ⏳ **Legal review** of the privacy/terms pages for the client's state.

## Per-client launch checklist

- [ ] Intake checklist complete. Every business claim is approved by the client in writing.
- [ ] Licenses verified on the issuing authority's lookup (`status: "verified"`, `verifiedAt`, `verifiedBy`). Licensing
      varies by state and locality, so record jurisdiction.
- [ ] Insurance certificate seen. Status set accordingly.
- [ ] Only offered services listed. Only real, sourced reviews (`verified: true`, with a source URL).
- [ ] Client-owned photos with usage rights (`isSample: false`).
- [ ] `mode: "production"`, `NEXT_PUBLIC_SITE_ENV=production` only on the production deployment.
- [ ] Notification recipients confirmed. Test email received.
- [ ] AI: enabled only for eligible pilot clients. Allowance 100 conversations/month. Monthly cost cap set.
- [ ] `pnpm prelaunch` passes. A test inquiry is marked Closed afterward.

## Known limitations (accepted for the $197 tier)

- CSP ships `frame-ancestors 'none'` plus standard security headers. A full script CSP was deferred to avoid breaking
  Next.js inline scripts without a verified nonce setup.
- Phone-click and CTA analytics come from unauthenticated beacons. They are approximate and labeled as such in reports.
- Photos are stored in Postgres (`bytea`), downscaled client-side, and purged after 180 days. That's fine at expected
  volume. Revisit object storage if a client exceeds ~1 GB.
- There is no automated scheduling, SMS, CRM, or AI phone answering. Those are excluded by the offer.
