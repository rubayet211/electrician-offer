import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3300",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-390",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm start -p 3300",
    env: {
      VERCEL_URL: "localhost:3300",
      IP_HASH_SECRET: "e2e-ip-secret",
      ADMIN_PASSWORD_HASH:
        "scrypt$16384$8$1$IlLvjJHEGJKGSGdb5SlAGw==$SvdHGA0yAsgXG75blCuSU0EbKH1oigDtyqWjEimUdPCSWFVwgg0RAoXQnggCBJgxAgDzPF51ykq6p4O1tLJrHQ==",
      ADMIN_SESSION_SECRET: "e2e-admin-session-secret-random-32chars",
      AI_SESSION_SECRET: "e2e-ai-secret",
      CRON_SECRET: "e2e-cron-secret",
      REPORT_API_SECRET: "e2e-report-secret",
    },
    url: "http://localhost:3300",
    reuseExistingServer: false,
    timeout: 240000,
  },
});
