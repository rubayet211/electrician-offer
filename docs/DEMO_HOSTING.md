# Production demo hosting

A client configured with `mode: "demo"` can run without `DATABASE_URL` when `DEMO_AI_LIVE` is not `true`. Its mock assistant does not call the paid provider. Leads, rate limits, and reporting data remain in process memory and are disposable; demo leads are never emailed. Restarts and separate instances do not share this data.

Set `IP_HASH_SECRET`, `AI_SESSION_SECRET`, and `CRON_SECRET` in production. Set `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` to enable admin access. If either admin credential is missing, the login page displays an unavailable message with HTTP 200; authenticated admin APIs and login return 503. Next.js Server Components cannot set a 503 response directly during rendering.

All non-demo production sites and demos with `DEMO_AI_LIVE=true` require `DATABASE_URL`. Live AI also requires `OPENROUTER_API_KEY`.
