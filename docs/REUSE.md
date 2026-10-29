# Reuse Ledger: Plumbing Foundation → Electrician Product

Source: `dons-plumbing` (read-only reference, unmodified). No plumbing branding, customer data, geography,
testimonials, contact details or secrets were carried over.

## Reused (patterns, then re-implemented or hardened)

| Area                                     | What carried over                                                                         | What changed                                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                                    | Next.js 16 / React 19 / Tailwind 4 / zod / `ai` SDK + OpenRouter provider / `pg` / vitest | + PGlite and Playwright for real SQL and browser tests                                                                                                                    |
| Typed client config                      | Zod-validated per-client config, one deployment per client                                | Electrician schema: form types, credential verification status, `isSample`, positioning/practices, uploads, AI limits                                                     |
| Lead storage                             | Postgres lead table, demo flag, source attribution                                        | Verified TLS (plumbing used `rejectUnauthorized:false`). No tmpdir fallback in production. Idempotency keys, content-hash dedupe, notification state machine, attachments |
| Email                                    | Resend over `fetch`, HTML escaping                                                        | Idempotency-Key, bounded cron retries, `failed_final`. Never claims inbox delivery                                                                                        |
| AI assistant                             | OpenRouter + ZDR routing idea, quota concept, mock model for demos                        | Server-signed sessions (plumbing trusted client IDs). Atomic store-backed quota. Model only _drafts_; human confirms server-side. Deterministic hazard short-circuit      |
| Sticky mobile call bar, analytics events | Concept                                                                                   | Rebuilt in the new design system. PII-free event whitelist                                                                                                                |
| Provisioning + monthly report scripts    | Concept                                                                                   | Rebuilt. Reports state measured facts only (plumbing hardcoded "SSL Valid & Auto-Renewed")                                                                                |

## Weaknesses found in the source and not inherited

1. PG TLS verification disabled.
2. Leads could land in temporary filesystem storage on serverless.
3. In-memory rate limiter (per-instance, bypassable).
4. Client-chosen AI session IDs (quota bypass by ID rotation).
5. The model's tool call wrote leads directly; no human confirmation.
6. The monthly report fabricated maintenance facts.

## Built specifically for electricians

- Service-aware 3-step estimate form with conditional fields for panel upgrades, EV chargers, troubleshooting,
  lighting and generators. It never asks homeowners to open panels or inspect live equipment.
- Safety layer: hazard notices in the form, a deterministic AI hazard detector (fire, smoke, sparks, shock,
  downed lines, water in panel) that answers with 911/utility guidance and no model call, and a prompt rule plus
  output guard against DIY, code-compliance, pricing and dispatch claims.
- Credential model that reflects state/local licensing variance: label, number, authority, jurisdiction,
  verification URL and status. Only verified items render as verified; demo items render as SAMPLE.
- Electrical design language: navy/steel/amber, Archivo + IBM Plex, blueprint motifs, spec-sheet credential
  tables.
- Optional estimate photos: client-side downscale and EXIF strip, magic-byte validation, private admin-only
  serving, 180-day retention.
- Electrician JSON-LD (`Electrician` LocalBusiness subtype, `Service`, `FAQPage`) restricted to verified facts.
