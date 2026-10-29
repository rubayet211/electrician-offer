import { mkdir, writeFile } from "node:fs/promises";
const requestedMonth = process.argv[2];
if (requestedMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth))
  throw new Error("Expected YYYY-MM");
const base = process.env.REPORT_API_URL;
const secret = process.env.REPORT_API_SECRET;
if (!base || !secret) throw new Error("REPORT_API_URL and REPORT_API_SECRET are required");
const url = new URL("/api/reports/monthly", base);
if (requestedMonth) url.searchParams.set("month", requestedMonth);
const response = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
if (!response.ok) throw new Error(`Report request failed: ${response.status}`);
const report = await response.json();
const month = report.month;
if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
  throw new Error("Invalid report month");
await mkdir(".reports", { recursive: true });
await writeFile(`.reports/${month}.json`, JSON.stringify(report, null, 2) + "\n");
await writeFile(
  `.reports/${month}.md`,
  `# Monthly report ${month}\n\nClicks, requests and manually confirmed bookings are distinct measures.\n\n` +
    Object.entries(report)
      .filter(([, value]) => typeof value === "number")
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n") +
    `\n\n## Requests by service\n\n${JSON.stringify(report.byService, null, 2)}\n\n## Requests by status\n\n${JSON.stringify(report.byStatus, null, 2)}\n\n## Maintenance\n\n${report.maintenance.map((entry) => `- ${entry.date}: ${entry.minutes} minutes � ${entry.description}`).join("\n")}\n`,
);
