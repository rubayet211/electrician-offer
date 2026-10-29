# Commercial Economics: Electrician Call & Estimate Website

Offer: $0 setup, $197/month, 6-month initial term ($1,182 per client).

Everything below is an **assumption**, not a measurement. No client has run on this stack yet. Replace each
assumption with the real figure after the first 1–3 clients, especially labor hours. Check vendor prices
before quoting, because they change. The model hardcodes none of them.

## Unit cost assumptions (per month)

| Item | Assumption | Basis / note |
|---|---|---|
| Hosting | Vercel Pro, **$20/mo shared** (1 seat), all client projects in one team | Hobby tier is non-commercial, so it can't host client sites. Overage unlikely at small-business traffic. |
| Database | **$5/client** budget (Neon or similar; one DB per client) | Low-traffic projects may fit free/entry tiers. $5 is a safety budget. |
| Email | Resend: free for 1 domain; **$20/mo shared** for up to ~10 sending domains; **$90/mo** beyond | Each client sends from its own verified domain. One lead = one email. |
| AI | **≤ $1.50/client** at 100 conversations | Assumes ~6 turns × ~3.5k input + ~350 output tokens per conversation (~21k in / ~2k out). Hard ceiling via OpenRouter `max_price` $0.50/M in, $2/M out → ≤ $0.015 per conversation. Typical ZDR endpoints cost less. Actual cost is recorded per month in `ai_usage_months`. |
| Photo storage | ~$0 | Stored in the client DB. Client-side downscale gives ~300 KB/photo, ~20 MB/month at typical volume. Deleted after 180 days. |
| Monitoring | $0 | Free uptime monitor + Vercel logs. Upgrade only if needed. |
| Payment processing | 2.9% + $0.30 per charge | Stripe card pricing assumption. |
| Domain | $0 | The client owns it. If Axinofy buys it, add ~$1.25/mo. |

## Labor assumptions

| Activity | Hours | Note |
|---|---|---|
| First client setup | 14 h | Intake, config, copy approval, photos, staging, 2 revision rounds, DNS/email, prelaunch. |
| Repeat client setup | 6 h | `pnpm provision` + config + content + prelaunch. Most time goes to collecting verified facts. |
| Monthly care | 2 h/client | ≤60 min content updates (contract cap), report generation + review, dependency/security updates, monitoring. |
| Support beyond scope | not modeled | Contract excludes unlimited changes, ads, advanced SEO. |

## Six-month contribution margin (computed)

Contribution = revenue − processing − per-client infra − shared infra − labor. Sales/acquisition cost, overhead
and churn are **excluded**.

### Labor valued at $25/h

| Clients | Revenue | Processing | Per-client infra | Shared infra | Labor h (setup + care) | Labor $ | Contribution | Per client | Margin |
|---|---|---|---|---|---|---|---|---|---|
| 1 | $1,182 | $36 | $39 | $120 | 14 + 12 | $650 | **$337** | $337 | 28.5% |
| 5 | $5,910 | $180 | $195 | $240 | 38 + 60 | $2,450 | **$2,845** | $569 | 48.1% |
| 10 | $11,820 | $361 | $390 | $240 | 68 + 120 | $4,700 | **$6,129** | $613 | 51.9% |
| 20 | $23,640 | $722 | $780 | $660 | 128 + 240 | $9,200 | **$12,278** | $614 | 51.9% |

### Labor valued at $50/h

| Clients | Contribution | Per client | Margin |
|---|---|---|---|
| 1 | −$313 | −$313 | −26.5% |
| 5 | $395 | $79 | 6.7% |
| 10 | $1,429 | $143 | 12.1% |
| 20 | $3,078 | $154 | 13.0% |

## What this means

- **Labor is the whole game.** Infra plus AI is about $14/client/month (≈7% of price). Each extra hour of
  monthly care per client costs $25–50 out of $197.
- **Repeat setup time matters most at scale.** It is the cost the $0-setup offer front-loads. At 6 h, setup is
  repaid in about 1 month. At 14 h, it takes about 2–3 months. The 6-month term protects this.
- **AI is not a cost risk** at 100 conversations/month, given `max_price` and the atomic quota. The risk is
  support time spent explaining it, so keep it limited to pilot clients.
- **Keep the 60-minute monthly cap enforced** and log time in the admin maintenance log, so reports and margin
  use real numbers.

## Measure after first clients

1. Actual setup hours per client (split into fact-gathering vs build).
2. Monthly care minutes (from `maintenance_log`).
3. AI tokens and cost per conversation (from `ai_usage_months`).
4. DB size growth and photo volume.
5. Resend sends per month, and whether more than 10 domains forces the higher tier.
