# Admin & Operations Guide

This guide describes how to access and manage the electrician website admin portal, interpret customer inquiry records, track monthly performance metrics, and handle system maintenance.

---

## 1. Logging In

- **Access URL:** `/admin/login`
- **Authentication:** Admin access uses a single contractor/agency administrator password verified using an scrypt password hash (`ADMIN_PASSWORD_HASH`).
- **Session Security:** A successful login issues an HMAC-signed session cookie (`admin_session`) valid for 8 hours. The cookie is `httpOnly`, `SameSite=Strict`, and marked `Secure` in production environments.
- **Rate Limiting:** Login attempts are rate-limited to 5 attempts per 15 minutes per IP address. Exceeding this limit returns HTTP 429 to safeguard against brute-force credential attacks.
- **Logging Out:** Click **"Log out"** in the top navigation bar of the Leads or Report pages. This immediately clears the session cookie and redirects to `/admin/login`.

---

## 2. Lead Statuses & Workflow Meaning

> [!IMPORTANT]
> **Internal Record States vs. Customer Bookings:**
> Inquiry statuses represent **internal contractor workflow stages** for managing customer leads. They do **NOT** represent confirmed customer bookings or calendar appointments on the contractor's dispatch schedule.

The available lead statuses are:

| Status              | Meaning                                                                                                                |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| **`new`**           | Inbound estimate request received from the website contact form or AI assistant. Unreviewed.                           |
| **`contacted`**     | The contractor or office staff has reached out to the homeowner by phone, email, or text to discuss the scope of work. |
| **`estimate_sent`** | A formal quote, bid, or ballpark estimate has been delivered to the customer.                                          |
| **`scheduled`**     | Job dates and time window have been agreed upon and placed on the contractor's dispatch calendar.                      |
| **`closed`**        | Work has been completed and invoiced, or the inquiry was declined, cancelled, or archived.                             |

---

## 3. Marking a Booking as Manually Confirmed

Website estimate inquiries represent customer interest, not completed sales. To accurately track conversion without guessing:

1. Open the lead detail page: `/admin/leads/[id]`
2. Locate the **Update Lead Status** panel on the right.
3. Check the box labeled **"Booking confirmed (manually verified)"**.
4. Optionally record an internal note (e.g., _"Customer approved $1,800 EV charger quote; scheduled for Nov 14"_).
5. Click **"Save"**.

This persists a `booking` event in the lead's event history. The monthly performance report aggregates these manual confirmations under **Confirmed bookings**, providing verified job conversion figures.

---

## 4. Retrying Failed Notifications

When a customer submits an inquiry, the system sends an email notification to the contractor's configured notification recipients using Resend.

- **Notification Statuses:**
  - `sent`: Successfully accepted by the email provider.
  - `pending`: Notification is queued for delivery.
  - `skipped_demo`: Demo mode submission (emails are intentionally suppressed in demo environments).
  - `failed` or `failed_final`: Email provider rejected delivery or network error occurred.

### How to retry a failed notification:

1. Open the lead detail screen (`/admin/leads/[id]`).
2. If the lead is in `failed` or `pending` status, an alert box displays: _"Notification pending or failed"_.
3. Click **"Retry notification"**.
4. The system attempts immediate re-delivery and logs the outcome.

In production, an automated background cron (`/api/cron/notifications`) also retries pending or failed notifications with exponential backoff (up to 5 total attempts).

---

## 5. Exporting Leads to CSV

Contractors and accountants can export inquiry data into spreadsheets (Excel, Google Sheets, or Numbers):

- **From the Leads list:** Click the **"Export CSV"** button in the header (exports current month).
- **From the Monthly Report:** Click **"Download CSV"** in the report header (exports the selected month).
- **Direct endpoint:** `/api/admin/leads/export?month=YYYY-MM` (requires active admin session).

### Security: Formula Injection Protection

Spreadsheet software can execute untrusted formulas if user-submitted fields start with special characters. To prevent formula injection (CSV Injection / CWE-1236), any exported field beginning with `=`, `+`, `-`, `@`, tab (`\t`), or carriage return (`\r`) is automatically prefixed with a leading apostrophe (`'`) in accordance with RFC 4180 and spreadsheet safety standards.

---

## 6. Monthly Operational & Performance Report

- **Access URL:** `/admin/report`
- **Month Parameter:** Append `?month=YYYY-MM` to review historical months (e.g., `/admin/report?month=2026-10`).

### Measured Facts vs. Estimated Conversions

The report intentionally avoids synthetic conversion estimates or artificial dollar figures. Instead, it reports distinct, measured facts:

- **Phone CTA clicks:** Direct clicks to call your phone number from website call buttons.
- **Estimate CTA clicks:** Clicks on "Request Estimate" buttons to access the form.
- **Form starts:** Visitors who began typing or selecting options in the estimate form.
- **Estimate requests:** Completed inquiries received through the contact form or AI assistant.
- **Confirmed bookings:** Real customer jobs manually confirmed and flagged by the contractor.
- **Notification failures:** Count of inquiries that failed email alert dispatch.
- **AI conversations & cost:** Assistant interactions used against the monthly allowance and actual OpenRouter provider cost.
- **Maintenance log:** Time logged by Axinofy for updates, compliance checks, and site maintenance.

### Adding a Maintenance Log Entry:

At the bottom of the Monthly Report page, use the **Add maintenance entry** form to record maintenance work (Date, Minutes, and Description). Entries are permanently saved in the database for billing transparency.

---

## 7. Photo Retention & Security

Homeowners can upload up to 3 photos of their electrical panel, equipment label, or work area when requesting an estimate.

- **Safety Guidance:** Homeowners are explicitly instructed never to remove panel covers or approach exposed live wiring to take photographs.
- **File Validation:** The server validates image magic bytes (supporting JPEG, PNG, and WebP up to 4MB per file). Disguised or corrupt files are rejected without blocking lead submission.
- **Private Access:** Uploaded photos are served exclusively through `/api/admin/attachments/[id]`, which requires an authenticated admin session and enforces `X-Content-Type-Options: nosniff` and `Cache-Control: private, no-store`.
- **Retention Cron:** Customer photos are retained for a configurable period (default `180` days). An automated retention cron job (`/api/cron/retention`) runs periodically to purge attachments older than the retention window, safeguarding customer privacy and preventing unbounded storage growth.
