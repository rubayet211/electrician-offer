# Client Onboarding Intake & Verification Checklist

Template reference for provisioning new electrical contractor clients. Complete all sections before prelaunch validation.

---

## 1. Business Facts & Identity

- [ ] **Legal Business Name:** (e.g., Acme Electrical Services LLC)
- [ ] **Public DBA / Trade Name:** (e.g., Acme Electric)
- [ ] **Owner / Master Electrician Name:**
- [ ] **Physical Street Address:**
- [ ] **City, State, ZIP Code:**
- [ ] **Address Visibility Preference:**
  - [ ] `showPublicly: true` (Commercial shop / walk-in storefront)
  - [ ] `showPublicly: false` (Home-based business / service-area only — protects owner home privacy)
- [ ] **Primary Telephone (E.164 format):** (e.g., `+15551234567`)
- [ ] **Phone Display Format:** (e.g., `(555) 123-4567`)
- [ ] **Public Contact Email:** (e.g., `info@acmeelectric.com`)
- [ ] **Years in Business / Year Founded:**
- [ ] **Local Time Zone (IANA format):** (e.g., `America/New_York`, `America/Chicago`, `America/Denver`, `America/Los_Angeles`)

---

## 2. Licensing & Jurisdictional Verification

_Note: Electrical licensing regulations vary by state, county, and municipality. Some states license electrical contractors statewide; others license at the county or municipal level. Collect details for every active jurisdiction._

### State / Primary License

- [ ] **License Label / Classification:** (e.g., Master Electrician / Electrical Contractor)
- [ ] **License Number:**
- [ ] **Issuing Authority:** (e.g., State Department of Labor & Licensing)
- [ ] **Jurisdiction:** (State / County / City)
- [ ] **Official Verification Portal URL:**
- [ ] **Axinofy Verification Check:**
  - [ ] Searched authority database and confirmed active status
  - [ ] `verifiedAt`: (YYYY-MM-DD)
  - [ ] `verifiedBy`: (Staff member name)

### Municipal / County License (if applicable)

- [ ] **License Label / Classification:**
- [ ] **License Number:**
- [ ] **Issuing Authority:**
- [ ] **Jurisdiction:**
- [ ] **Official Verification Portal URL:**
- [ ] **Axinofy Verification Check:**
  - [ ] Searched authority database and confirmed active status
  - [ ] `verifiedAt`: (YYYY-MM-DD)
  - [ ] `verifiedBy`: (Staff member name)

---

## 3. Insurance & Bonding

- [ ] **Certificate of General Liability Insurance (COI):**
  - [ ] Carrier name:
  - [ ] Coverage limits: (e.g., $1,000,000 / $2,000,000 aggregate)
  - [ ] Verified active policy: `status: "verified"`, `verifiedAt`: (YYYY-MM-DD)
- [ ] **Surety Bond (if required by jurisdiction):**
  - [ ] Bonded confirmation: `bonded: true` / `false`

---

## 4. Photos & Media Rights

- [ ] **Rights Ownership Confirmation:** Written confirmation that client owns rights to all submitted photos (no stock or uncredited third-party imagery).
- [ ] **High-Resolution Logo:** Vector SVG or transparent PNG.
- [ ] **Project Gallery Photos:** 4–8 real photos of completed projects (panels, chargers, lighting, fixtures).
- [ ] **Alt text & caption descriptions provided for each project photo.**

---

## 5. Verified Customer Reviews

- [ ] **3–10 Authenticated Customer Reviews:**
  - [ ] Review 1: Author, Star Rating (1–5), Quote text, Source (Google/Yelp/Angi), Source URL (`verified: true`)
  - [ ] Review 2: Author, Star Rating (1–5), Quote text, Source, Source URL (`verified: true`)
  - [ ] Review 3: Author, Star Rating (1–5), Quote text, Source, Source URL (`verified: true`)
- [ ] Unverified reviews excluded from config or marked `verified: false`.

---

## 6. Confirmed Service Offerings & Service Areas

- [ ] **Offered Services Confirmed:** (Only offered services set to `offered: true`)
  - [ ] Repair and Troubleshooting
  - [ ] Panel Upgrades & Replacements
  - [ ] EV Charger Installation
  - [ ] Lighting Installation
  - [ ] Generator Installation
  - [ ] Outlets and Switches
  - [ ] Surge Protection
  - [ ] Electrical Inspections
- [ ] **Service Areas Named:** Primary metro and surrounding communities.
- [ ] **Target ZIP Codes Listed:** Verified within operational range.

---

## 7. Operating Hours & Emergency Policy

- [ ] **Standard Business Hours Confirmed:** (e.g., Monday - Friday, 8:00 AM - 5:00 PM)
- [ ] **Emergency Service Capacity:**
  - [ ] Standard hours only (`emergency.offered: false`)
  - [ ] Verified 24/7 on-call coverage (`emergency.offered: true` & `emergency.verified: true` with written proof of dispatch readiness)
- [ ] **Emergency Safety Disclaimers Reviewed:** Safety warnings to dial 911 for fires, sparking, or downed lines.

---

## 8. Notification Routing

- [ ] **Lead Notification Email(s):** Confirmed active inboxes (non-example addresses).
- [ ] **Sender Address:** `inquiries@notifications.<domain>` or verified custom domain.
- [ ] **SMS Forwarding Contact (optional):**

---

## 9. Domain & DNS Access

- [ ] **Bare Domain Name Confirmed:** (e.g., `acmeelectrical.com` — no subdomains or trailing slashes).
- [ ] **DNS Registrar Access Acquired:** (Cloudflare, GoDaddy, Namecheap, etc.).
- [ ] **Resend Email Authentication Records Added:**
  - [ ] MX / SPF TXT records
  - [ ] DKIM CNAME records
  - [ ] DMARC TXT record
- [ ] **Vercel DNS Records Added:** (A record / CNAME for production).

---

## 10. Search Console & Google Business Profile Alignment

- [ ] **Google Business Profile Alignment:** Name, Address, and Phone (NAP) match client config exactly.
- [ ] **Google Search Console (GSC) Domain Property Created:**
- [ ] **GSC Verification Token Obtained & Added to `config.seo.gscVerification`:**
- [ ] **Sitemap Submission Scheduled:** (`https://<domain>/sitemap.xml` after DNS propagation).
- [ ] **Client Expectations Set:** No false guarantees of ranking positions or instant traffic.

---

## 11. AI Assistant Opt-in & Knowledge Base

- [ ] **Client Opt-In Confirmed:** (`ai.enabled: true` or `false`)
- [ ] **If Enabled:**
  - [ ] Assistant display name: (e.g., "Acme Electrical Assistant")
  - [ ] Approved knowledge items reviewed (pricing policy, service radius, emergency disclaimer).
  - [ ] Safety constraints understood (assistant never gives DIY electrical advice or diagnoses live panels).
