import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { PgStore, type Db, type DbQuery } from "@/lib/store/pg-store";
import type { Lead } from "@/lib/store/types";
const url = process.env.TEST_DATABASE_URL;
describe.skipIf(!url)("real PostgreSQL concurrency", () => {
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  let admin: Pool, pool: Pool, store: PgStore;
  beforeAll(async () => {
    admin = new Pool({ connectionString: url });
    await admin.query(`CREATE SCHEMA ${schema}`);
    pool = new Pool({ connectionString: url, max: 20, options: `-c search_path=${schema}` });
    await pool.query(await readFile("lib/db/migrations/001_init.sql", "utf8"));
    await pool.query(await readFile("lib/db/migrations/002_ai_confirmation_key.sql", "utf8"));
    const adapter = (client: Pick<Pool, "query">): DbQuery => ({
      query: async <T>(sql: string, args?: unknown[]) => ({
        rows: (await client.query(sql, args)).rows as T[],
      }),
    });
    const db: Db = {
      ...adapter(pool),
      transaction: async (fn) => {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn(adapter(client));
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      },
    };
    store = new PgStore(db);
  });
  afterAll(async () => {
    await pool?.end();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await admin.end();
    }
  });
  const lead = (i: number, key: string, hash: string): Lead => ({
    id: `id${i}`,
    reference: `EL-${String(i).padStart(6, "0")}`,
    createdAt: new Date().toISOString(),
    name: "Alex",
    phone: "+15550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
    consent: true,
    idempotencyKey: key,
    details: { formType: "panel", reason: "adding_load", propertyType: "single_family" },
    source: "contact_form",
    ipHash: "hash",
    isDemo: true,
    status: "new",
    notificationStatus: "pending",
    notificationAttempts: 0,
    dedupeHash: hash,
    photoCount: 0,
  });
  it("serializes idempotency and dedupe across connections", async () => {
    const key = randomUUID();
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) => store.leads.create(lead(i, key, `hash${i}`), [])),
    );
    expect(new Set(results.map((value) => value.id)).size).toBe(1);
    const duplicates = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        store.leads.create(lead(i + 20, randomUUID(), "same"), []),
      ),
    );
    expect(new Set(duplicates.map((value) => value.id)).size).toBe(1);
  });
  it("limits concurrent quota reservations", async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => store.aiUsage.reserve("2099-01", 4)),
    );
    expect(results.filter(Boolean)).toHaveLength(4);
  });
  it("consumes a draft once across connections", async () => {
    const now = new Date();
    await store.aiSessions.create({
      id: "session",
      visitorHash: "hash",
      month: "2099-01",
      startedAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      visitorMessages: 0,
      counted: false,
      reservationState: "none",
    });
    await store.aiDrafts.create({
      token: "draft",
      sessionId: "session",
      payload: { valid: true },
      expiresAt: new Date(+now + 60000).toISOString(),
    });
    const results = await Promise.all(
      Array.from({ length: 12 }, () => store.aiDrafts.consume("draft", "session")),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });
});
