# Client Onboarding Guide: Electrician Website Product

This document provides the standard operating procedure for onboarding a new electrical contractor client onto the Axinofy managed platform ($197/mo).

---

## 1. Intake

- Distribute `clients/_template/INTAKE_CHECKLIST.md` to the client.
- Collect essential business facts:
  - Exact legal business name and public trade name (DBA).
  - Business physical address and whether to show the street address publicly (hide for home-based electricians to protect privacy).
  - Primary contact phone number (E.164 format) and display format.
  - State and local electrical contractor / master electrician license numbers.
  - Certificate of Insurance (COI) for general liability coverage.
  - High-resolution logo and real photos of completed projects (confirm client ownership rights).
  - Confirmed list of offered services (only offered services will have pages created).
  - Target service area communities and ZIP codes.
  - Operating hours and emergency service policy.
  - Notification recipient email addresses.
  - Domain registrar access.
  - AI chat assistant opt-in preference.

---

## 2. Provisioning

Run the provisioning command from repository root:

```bash
pnpm provision --slug <slug> --name "<Company Name>" --domain <domain.com>
```

This generates:

- `clients/<slug>/client.config.ts` (populated with name and domain, other fields set to parseable `__REQUIRED__` placeholders).
- `clients/<slug>/.env.example` (complete environment variable template with generation instructions).
- `clients/<slug>/INTAKE_CHECKLIST.md` (client-specific onboarding tracking checklist).

_Note:_ Slug must consist only of lowercase alphanumeric characters and hyphens `[a-z0-9-]`.

---

## 3. Configuration

1. Open `clients/<slug>/client.config.ts` and populate all client data from the completed intake checklist.
2. Ensure phone number is in strict E.164 format (`+1XXXXXXXXXX`).
3. Set `showPublicly: false` under `address` if the electrician operates from a residential address or service-area model.
4. Ensure at most 8 pages are enabled under `pages`.
5. Set up the production infrastructure:
   - Create isolated Vercel project and Postgres database.
   - Configure environment variables in Vercel matching `clients/<slug>/.env.example`.
   - Run database migrations: `pnpm db:migrate`.
6. Activate the client configuration locally:

```bash
pnpm provision --activate <slug>
```

---

## 4. Staging Deployment (Noindex)

- Deploy to Vercel staging or preview environment.
- Verify `config.mode` is `"staging"` or `NEXT_PUBLIC_SITE_ENV !== "production"`.
- Ensure search engine indexing is blocked:
  - `<meta name="robots" content="noindex, nofollow" />` is rendered on all pages.
  - `robots.txt` outputs `Disallow: /`.
- Share the staging link with the client for review.

---

## 5. Revision Rounds

The standard onboarding includes two structured revision cycles:

- **Round 1:** Content, copy adjustments, project photos, service descriptions, and layout review. Implement approved changes.
- **Round 2:** Final review of branding, hours, contact information, and final sign-off.
- Obtain formal written sign-off before proceeding to production launch.

---

## 6. Verify Credentials

Before launching, Axinofy personnel must independently verify professional credentials:

1. **Licensing:** Search the state licensing board portal and relevant municipal/county registrar for the electrician's license number. Confirm the license is active, in good standing, and belongs to the entity.
2. In `client.config.ts`, record:
   - `status: "verified"`
   - `verifiedAt: "YYYY-MM-DD"`
   - `verifiedBy: "Staff Member Name"`
   - `verificationUrl: "https://...official-lookup-link..."`
3. **Insurance:** Verify general liability coverage directly on the Certificate of Insurance. Set `status: "verified"` and `verifiedAt`.
4. _Important:_ Any unverified licenses or sample credentials remain excluded from Schema.org JSON-LD structured data.

---

## 7. Prelaunch Automated Verification

Switch the configuration to production (`mode: "production"`, `NEXT_PUBLIC_SITE_ENV="production"`).
Run the prelaunch verification script:

```bash
pnpm prelaunch --url https://staging.example.com --env-file clients/<slug>/.env
```

The script validates:

- Static config checks: No `__REQUIRED__` placeholders, bare domain, phone E.164, valid recipient emails, verified licenses, <= 8 pages.
- Environment completeness: Database connection, Resend API key, admin secrets, AI keys (if enabled).
- Live URL crawl: 200 HTTP status, HTTPS, single `<h1>`, canonical links, meta descriptions, unique `<title>` tags, clickable `tel:` links, valid JSON-LD parsing, `robots.txt` permissions, and absence of `noindex`.
  All checks must pass with exit code `0` before pointing DNS.

---

## 8. DNS & Search Console Setup

1. **DNS Cutover:**
   - Point the root domain and `www` CNAME records to Vercel.
   - Configure SPF, DKIM, and DMARC DNS records for Resend email deliverability.
2. **Search Console (GSC) Setup:**
   - Add Domain Property in Google Search Console.
   - Verify ownership via DNS TXT record or HTML meta tag (`config.seo.gscVerification`).
   - Submit production sitemap (`https://<domain>/sitemap.xml`).
   - _Expectation Setting:_ Explicitly inform the client that submitting sitemaps enables indexing, but Axinofy never promises specific ranking positions, keyword placements, or overnight traffic.

---

## 9. Handover & Go-Live

1. Submit a live test inquiry via the website estimate form.
2. Confirm immediate notification delivery into the client's recipient inbox.
3. Verify lead appearance in the authenticated `/admin` portal.
4. Deliver login credentials and standard operating guidelines to the client.
5. Activate the client's monthly maintenance and support agreement.
