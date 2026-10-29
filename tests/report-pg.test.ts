import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";
import { monthlyReport } from "@/lib/reporting/monthly";
it("counts measured report values from PostgreSQL while excluding demo requests", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile("lib/db/migrations/001_init.sql", "utf8"));
    await db.exec(await readFile("lib/db/migrations/010_admin_reporting.sql", "utf8"));
    await db.query(
      "INSERT INTO analytics_events(id,type,page,created_at) VALUES ('a','phone_click','/','2026-10-01'),('b','estimate_cta_click','/','2026-10-01'),('c','form_start','/','2026-10-01')",
    );
    await db.query(
      "INSERT INTO leads(id,reference,created_at,name,phone,service_slug,description,urgency,details,consent,source,ip_hash,is_demo,status,notification_status,idempotency_key,dedupe_hash) VALUES ('1','EL-1','2026-10-01','A','123','panel','test','routine','{}',true,'contact_form','x',false,'new','failed','11111111-1111-4111-8111-111111111111','a'),('2','EL-2','2026-10-01','B','123','panel','test','routine','{}',true,'ai_chat','x',true,'new','pending','22222222-2222-4222-8222-222222222222','b')",
    );
    await db.query(
      "INSERT INTO lead_events(id,lead_id,type,value,created_at) VALUES ('e','1','booking','true','2026-10-02')",
    );
    await db.query(
      "INSERT INTO ai_usage_months(month,used,input_tokens,output_tokens,cost_usd) VALUES ('2026-10',2,100,30,0.01)",
    );
    const report = await monthlyReport("2026-10", new PgStore(db), true);
    expect([
      report.phoneClicks,
      report.estimateClicks,
      report.formStarts,
      report.formRequests,
      report.aiRequests,
      report.bookings,
      report.notificationFailures,
    ]).toEqual([1, 1, 1, 1, 0, 1, 1]);
    expect(report.byService).toEqual({ panel: 1 });
    expect([
      report.aiConversations,
      report.inputTokens,
      report.outputTokens,
      report.costUsd,
    ]).toEqual([2, 100, 30, 0.01]);
  } finally {
    await db.close();
  }
});
