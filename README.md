# Electrician Call & Estimate Website

Axinofy's managed website product for independent US electrical contractors ($197/month). Each client gets one
isolated deployment: a mobile-first public site, a service-aware estimate request form backed by Postgres, email
notifications, an optional AI inquiry assistant with a hard monthly allowance, a minimal admin view, and monthly
reporting.

The repo ships in **demo mode**: Meridian Electric Co. (Demo), a clearly labeled sample business. It sends no
notifications and makes no real-contractor claims.

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000, demo config, in-memory store, simulated AI
```

| Command                                                             | Purpose                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm typecheck` / `pnpm lint` / `pnpm test`                        | Static checks + vitest (unit, PGlite integration)                  |
| `pnpm test:e2e`                                                     | Playwright: routes, CTAs, estimate form, mobile widths, SEO basics |
| `pnpm build`                                                        | Production build                                                   |
| `pnpm db:migrate`                                                   | Apply SQL migrations to `DATABASE_URL` (idempotent)                |
| `pnpm provision --slug <slug> --name "<Company>" --domain <domain>` | Scaffold a new client                                              |
| `pnpm provision --activate <slug>`                                  | Point `config/client.config.ts` at a client                        |
| `pnpm prelaunch [--url https://staging…]`                           | Launch gate: config, env, DB, live page/SEO checks                 |
| `pnpm report:monthly`                                               | Monthly report (markdown + JSON)                                   |
| `node scripts/hash-admin-password.mjs`                              | Generate `ADMIN_PASSWORD_HASH`                                     |

Real-Postgres concurrency tests run when `TEST_DATABASE_URL` is set (e.g. a disposable Docker `postgres:16`).

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): spec and the source of truth
- [docs/DESIGN.md](docs/DESIGN.md): design system
- [docs/CLIENT_ONBOARDING.md](docs/CLIENT_ONBOARDING.md): intake → launch process
- [docs/OPERATIONS.md](docs/OPERATIONS.md): runbook (deploy, cron, retries, retention, incidents)
- [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md): launch checklist and verification status
- [docs/COMMERCIAL_ECONOMICS.md](docs/COMMERCIAL_ECONOMICS.md): cost and margin model
- [docs/REUSE.md](docs/REUSE.md): what came from the plumbing foundation and what is electrician-specific

## Publishing

This is a standalone local repo (`electrician-site`). No GitHub repository was created. To publish:

```bash
gh repo create rubayet211/electrician-site --private --source . --push
```
