#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return options;
}

const DEFAULT_INTAKE_CHECKLIST = `# Client Onboarding Intake & Verification Checklist

Template reference for provisioning new electrical contractor clients. Complete all sections before prelaunch validation.

---

## 1. Business Facts & Identity
- [ ] **Legal Business Name:** (e.g., Acme Electrical Services LLC)
- [ ] **Public DBA / Trade Name:** (e.g., Acme Electric)
- [ ] **Owner / Master Electrician Name:**
- [ ] **Physical Street Address:**
- [ ] **City, State, ZIP Code:**
- [ ] **Address Visibility Preference:**
  - [ ] \`showPublicly: true\` (Commercial shop / walk-in storefront)
  - [ ] \`showPublicly: false\` (Home-based business / service-area only — protects owner home privacy)
- [ ] **Primary Telephone (E.164 format):** (e.g., \`+15551234567\`)
- [ ] **Phone Display Format:** (e.g., \`(555) 123-4567\`)
- [ ] **Public Contact Email:** (e.g., \`info@acmeelectric.com\`)
- [ ] **Years in Business / Year Founded:**
- [ ] **Local Time Zone (IANA format):** (e.g., \`America/New_York\`, \`America/Chicago\`, \`America/Denver\`, \`America/Los_Angeles\`)

---

## 2. Licensing & Jurisdictional Verification
*Note: Electrical licensing regulations vary by state, county, and municipality. Some states license electrical contractors statewide; others license at the county or municipal level. Collect details for every active jurisdiction.*

### State / Primary License
- [ ] **License Label / Classification:** (e.g., Master Electrician / Electrical Contractor)
- [ ] **License Number:**
- [ ] **Issuing Authority:** (e.g., State Department of Labor & Licensing)
- [ ] **Jurisdiction:** (State / County / City)
- [ ] **Official Verification Portal URL:**
- [ ] **Axinofy Verification Check:**
  - [ ] Searched authority database and confirmed active status
  - [ ] \`verifiedAt\`: (YYYY-MM-DD)
  - [ ] \`verifiedBy\`: (Staff member name)

### Municipal / County License (if applicable)
- [ ] **License Label / Classification:**
- [ ] **License Number:**
- [ ] **Issuing Authority:**
- [ ] **Jurisdiction:**
- [ ] **Official Verification Portal URL:**
- [ ] **Axinofy Verification Check:**
  - [ ] Searched authority database and confirmed active status
  - [ ] \`verifiedAt\`: (YYYY-MM-DD)
  - [ ] \`verifiedBy\`: (Staff member name)

---

## 3. Insurance & Bonding
- [ ] **Certificate of General Liability Insurance (COI):**
  - [ ] Carrier name:
  - [ ] Coverage limits: (e.g., $1,000,000 / $2,000,000 aggregate)
  - [ ] Verified active policy: \`status: "verified"\`, \`verifiedAt\`: (YYYY-MM-DD)
- [ ] **Surety Bond (if required by jurisdiction):**
  - [ ] Bonded confirmation: \`bonded: true\` / \`false\`

---

## 4. Photos & Media Rights
- [ ] **Rights Ownership Confirmation:** Written confirmation that client owns rights to all submitted photos (no stock or uncredited third-party imagery).
- [ ] **High-Resolution Logo:** Vector SVG or transparent PNG.
- [ ] **Project Gallery Photos:** 4–8 real photos of completed projects (panels, chargers, lighting, fixtures).
- [ ] **Alt text & caption descriptions provided for each project photo.**

---

## 5. Verified Customer Reviews
- [ ] **3–10 Authenticated Customer Reviews:**
  - [ ] Review 1: Author, Star Rating (1–5), Quote text, Source (Google/Yelp/Angi), Source URL (\`verified: true\`)
  - [ ] Review 2: Author, Star Rating (1–5), Quote text, Source, Source URL (\`verified: true\`)
  - [ ] Review 3: Author, Star Rating (1–5), Quote text, Source, Source URL (\`verified: true\`)
- [ ] Unverified reviews excluded from config or marked \`verified: false\`.

---

## 6. Confirmed Service Offerings & Service Areas
- [ ] **Offered Services Confirmed:** (Only offered services set to \`offered: true\`)
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
  - [ ] Standard hours only (\`emergency.offered: false\`)
  - [ ] Verified 24/7 on-call coverage (\`emergency.offered: true\` & \`emergency.verified: true\` with written proof of dispatch readiness)
- [ ] **Emergency Safety Disclaimers Reviewed:** Safety warnings to dial 911 for fires, sparking, or downed lines.

---

## 8. Notification Routing
- [ ] **Lead Notification Email(s):** Confirmed active inboxes (non-example addresses).
- [ ] **Sender Address:** \`inquiries@notifications.<domain>\` or verified custom domain.
- [ ] **SMS Forwarding Contact (optional):**

---

## 9. Domain & DNS Access
- [ ] **Bare Domain Name Confirmed:** (e.g., \`acmeelectrical.com\` — no subdomains or trailing slashes).
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
- [ ] **GSC Verification Token Obtained & Added to \`config.seo.gscVerification\`:**
- [ ] **Sitemap Submission Scheduled:** (\`https://<domain>/sitemap.xml\` after DNS propagation).
- [ ] **Client Expectations Set:** No false guarantees of ranking positions or instant traffic.

---

## 11. AI Assistant Opt-in & Knowledge Base
- [ ] **Client Opt-In Confirmed:** (\`ai.enabled: true\` or \`false\`)
- [ ] **If Enabled:**
  - [ ] Assistant display name: (e.g., "Acme Electrical Assistant")
  - [ ] Approved knowledge items reviewed (pricing policy, service radius, emergency disclaimer).
  - [ ] Safety constraints understood (assistant never gives DIY electrical advice or diagnoses live panels).
`;

function generateEnvExample(name, slug) {
  return `# Environment Configuration for ${name} (${slug})

# 1. Database Connection
# Postgres connection string with SSL required
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
# Optional TLS certificate if connecting to private/self-signed database certs
# DATABASE_CA_CERT=""

# 2. Resend Email Notifications
# API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# 3. Security Secrets
# Generate random 32-byte base64url secret via:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
IP_HASH_SECRET=your_32_byte_base64url_ip_hash_secret_here

# Admin password hash generated via:
#   node scripts/hash-admin-password.mjs
ADMIN_PASSWORD_HASH=your_scrypt_password_hash_here

# Admin session signing secret:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
ADMIN_SESSION_SECRET=your_32_byte_base64url_admin_session_secret_here

# AI session cookie signing secret:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
AI_SESSION_SECRET=your_32_byte_base64url_ai_session_secret_here

# Cron route authentication secret (passed as Bearer token):
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
CRON_SECRET=your_32_byte_base64url_cron_secret_here

# 4. AI Assistant (OpenRouter)
# Required ONLY if ai.enabled is true in client config.
# Provider key from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key_here

# Set to "true" to run live OpenRouter calls during demo mode (optional)
# DEMO_AI_LIVE=false

# 5. Deployment Environment
# Set to "production" in production deployment, "staging" for staging/preview, or "demo" for demo
NEXT_PUBLIC_SITE_ENV=production
`;
}

function generateClientConfig(templateContent, name, domain) {
  if (templateContent) {
    let modified = templateContent;
    // Replace name and domain
    modified = modified.replace(/name:\s*required/g, `name: ${JSON.stringify(name)}`);
    modified = modified.replace(/domain:\s*required/g, `domain: ${JSON.stringify(domain)}`);
    return modified;
  }

  return `const required = "__REQUIRED__";
const template = {
  mode: "production" as const,
  business: { name: ${JSON.stringify(name)}, domain: ${JSON.stringify(domain)}, phone: required, phoneDisplay: required, email: required, timezone: "UTC", address: { city: required, state: required, zip: required, showPublicly: false } },
  positioning: { heroHeadline: required, heroSubhead: required, closingHeadline: required },
  practices: [{ title: required, description: required }],
  hours: [{ days: required, open: required, close: required }],
  emergency: { offered: false, verified: false },
  serviceAreas: [], services: [],
  pages: ["home", "services", "service-areas", "about", "contact", "privacy", "terms"].map((slug) => ({ slug, enabled: true })),
  credentials: { licenses: [], insurance: { status: "unverified" as const }, certifications: [] },
  reviews: [], projects: [], faqs: [],
  branding: { primary: required, accent: required },
  notifications: { recipients: [required], fromAddress: required },
  seo: { titleTemplate: required, defaultDescription: required },
  analytics: { enabled: true },
  uploads: { enabled: true, maxFiles: 3, maxBytesPerFile: 4 * 1024 * 1024, retentionDays: 180 },
  ai: { enabled: false, model: "deepseek/deepseek-v4.1-flash", monthlyConversationAllowance: 100, monthlyCostCapUsd: 5, maxVisitorMessagesPerConversation: 15, sessionInactivityMinutes: 30, maxOutputTokens: 500, newConversationsPerVisitorPerDay: 4, displayName: required, approvedKnowledge: [] },
};
export default template;
`;
}

function printNextSteps(slug, domain) {
  console.log(`\n======================================================`);
  console.log(`Next Manual Steps:`);
  console.log(`  1. Create Vercel project for ${slug}`);
  console.log(`  2. Create Postgres DB instance`);
  console.log(`  3. Set environment variables in Vercel (refer to clients/${slug}/.env.example)`);
  console.log(`  4. Run migrations: pnpm db:migrate`);
  console.log(`  5. Run prelaunch verification: pnpm prelaunch --url https://${domain}`);
  console.log(`======================================================\n`);
}

export function provision(options = {}) {
  const rootDir = options.root ? path.resolve(options.root) : process.cwd();

  // Activation mode
  if (options.activate) {
    const slug = String(options.activate).trim();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      console.error(`[ERROR] Invalid slug "${slug}". Slug must match [a-z0-9-].`);
      process.exit(1);
    }

    const clientDir = path.join(rootDir, "clients", slug);
    const clientConfigFile = path.join(clientDir, "client.config.ts");
    if (!fs.existsSync(clientConfigFile)) {
      console.error(`[ERROR] Client config does not exist at ${clientConfigFile}`);
      process.exit(1);
    }

    const activeConfigFile = path.join(rootDir, "config", "client.config.ts");
    if (!fs.existsSync(activeConfigFile)) {
      console.error(`[ERROR] Active config file not found at ${activeConfigFile}`);
      process.exit(1);
    }

    const currentContent = fs.readFileSync(activeConfigFile, "utf-8");
    const previousMatch = currentContent.match(
      /from\s+["']@\/clients\/([a-z0-9-]+)\/client\.config["']/,
    );
    const previousSlug = previousMatch ? previousMatch[1] : "unknown";

    console.log(`Previous active client slug: ${previousSlug}`);

    const newContent = `import { clientConfigSchema } from "@/types/client-config";
import client from "@/clients/${slug}/client.config";
export { default as clientConfig } from "@/clients/${slug}/client.config";
export const parsedClientConfig = clientConfigSchema.parse(client);
`;

    fs.writeFileSync(activeConfigFile, newContent, "utf-8");
    console.log(`Successfully activated client "${slug}" in config/client.config.ts.`);
    printNextSteps(slug, "example.com");
    return;
  }

  // Provision new client mode
  const { slug, name, domain, force } = options;

  if (!slug || !name || !domain) {
    console.error(
      `[ERROR] Missing required arguments.\nUsage: pnpm provision --slug <slug> --name "<Company>" --domain <domain> [--force]`,
    );
    process.exit(1);
  }

  const cleanSlug = String(slug).trim();
  if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
    console.error(`[ERROR] Invalid slug "${cleanSlug}". Slug must match [a-z0-9-].`);
    process.exit(1);
  }

  const outputDir = path.join(rootDir, "clients", cleanSlug);

  if (fs.existsSync(outputDir) && !force) {
    console.error(`[ERROR] Directory already exists: ${outputDir}`);
    console.error(`Use --force to overwrite.`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // 1. client.config.ts
  const templatePath = path.join(rootDir, "clients", "_template", "client.config.ts");
  let templateContent = null;
  if (fs.existsSync(templatePath)) {
    templateContent = fs.readFileSync(templatePath, "utf-8");
  }
  const clientConfigContent = generateClientConfig(templateContent, name, domain);
  fs.writeFileSync(path.join(outputDir, "client.config.ts"), clientConfigContent, "utf-8");

  // 2. .env.example
  const envExampleContent = generateEnvExample(name, cleanSlug);
  fs.writeFileSync(path.join(outputDir, ".env.example"), envExampleContent, "utf-8");

  // 3. INTAKE_CHECKLIST.md
  const checklistPath = path.join(rootDir, "clients", "_template", "INTAKE_CHECKLIST.md");
  let checklistContent = DEFAULT_INTAKE_CHECKLIST;
  if (fs.existsSync(checklistPath)) {
    checklistContent = fs.readFileSync(checklistPath, "utf-8");
  }
  fs.writeFileSync(path.join(outputDir, "INTAKE_CHECKLIST.md"), checklistContent, "utf-8");

  console.log(`\n======================================================`);
  console.log(`   CLIENT PROVISIONED: ${name}`);
  console.log(`======================================================`);
  console.log(`Slug:             ${cleanSlug}`);
  console.log(`Domain:           ${domain}`);
  console.log(`Directory:        ${outputDir}`);
  console.log(`Files Created:`);
  console.log(`  - client.config.ts`);
  console.log(`  - .env.example`);
  console.log(`  - INTAKE_CHECKLIST.md`);

  printNextSteps(cleanSlug, domain);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const args = parseArgs();
  provision(args);
}
