import { runMigrations } from "./helpers/migrations";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";
import type { Lead } from "@/lib/store/types";
it("serializes concurrent identical lead submissions and rolls back invalid attachments", async () => {
  const db = new PGlite();
  await runMigrations((sql) => db.exec(sql));
  const store = new PgStore(db);
  const now = new Date().toISOString();
  const base: Lead = {
    id: "base",
    reference: "EL-123456",
    createdAt: now,
    name: "Alex",
    phone: "+15550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
    consent: true,
    idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
    details: { formType: "panel", reason: "adding_load", propertyType: "single_family" },
    source: "contact_form",
    ipHash: "hash",
    isDemo: true,
    status: "new",
    notificationStatus: "pending",
    notificationAttempts: 0,
    dedupeHash: "same",
    photoCount: 0,
  };
  const first = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      store.leads.create(
        { ...base, id: `id${i}`, reference: `EL-${String(i).padStart(6, "0")}` },
        [],
      ),
    ),
  );
  expect(new Set(first.map((l) => l.id)).size).toBe(1);
  expect(await store.leads.list()).toHaveLength(1);
  const saved = first[0];
  const old = new Date(Date.now() - 11 * 60000);
  expect(await store.leads.claimNotification(saved.id, old)).toBe(true);
  expect(
    (await store.leads.list({ notificationStatus: ["sending"], retryBefore: new Date() })).map(
      (lead) => lead.id,
    ),
  ).toContain(saved.id);
  expect(await store.leads.claimNotification(saved.id, new Date())).toBe(true);
  await store.leads.finishNotification(saved.id, "failed");
  const other = {
    ...base,
    id: "other",
    reference: "EL-OTHER1",
    idempotencyKey: "6821288e-a4ba-405c-9c01-83f38732acb9",
    dedupeHash: "other",
  };
  await expect(
    store.leads.create(other, [
      {
        id: "dup",
        leadId: "other",
        name: "a",
        contentType: "image/jpeg",
        data: new Uint8Array([1]),
        createdAt: now,
      },
      {
        id: "dup",
        leadId: "other",
        name: "b",
        contentType: "image/jpeg",
        data: new Uint8Array([1]),
        createdAt: now,
      },
    ]),
  ).rejects.toThrow();
  expect(await store.leads.get("other")).toBeNull();
  await db.close();
});
