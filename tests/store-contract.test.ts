import { runMigrations } from "./helpers/migrations";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";
import { MemoryStore } from "@/lib/store/memory-store";
import type { Lead } from "@/lib/store/types";
const now = new Date("2026-10-29T12:00:00Z");
const time = now.toISOString();
const lead: Lead = {
  id: "lead1",
  reference: "EL-123456",
  createdAt: time,
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
  ipHash: "hashed",
  isDemo: true,
  status: "new",
  notificationStatus: "pending",
  notificationAttempts: 0,
  dedupeHash: "hash",
  photoCount: 1,
};
for (const kind of ["memory", "postgres"] as const)
  describe(`${kind} full store`, () => {
    it("manually claims eligible notifications and resets attempts, never demo", async () => {
      const db = kind === "postgres" ? new PGlite() : null;
      if (db) await runMigrations((sql) => db.exec(sql));
      const store = db ? new PgStore(db) : new MemoryStore();
      await store.leads.create(
        {
          ...lead,
          isDemo: false,
          isTest: true,
          notificationStatus: "failed_final",
          notificationAttempts: 5,
          notificationLastAttemptAt: time,
        },
        [],
      );
      expect((await store.leads.get(lead.id))?.isTest).toBe(true);
      expect(await store.leads.claimNotification(lead.id, now)).toBe(false);
      expect(await store.leads.claimNotification(lead.id, now, true)).toBe(true);
      expect((await store.leads.get(lead.id))?.notificationAttempts).toBe(1);
      expect(await store.leads.claimNotification(lead.id, now, true)).toBe(false);
      await store.leads.create(
        {
          ...lead,
          id: "demo",
          reference: "EL-DEMO",
          idempotencyKey: "22222222-2222-4222-8222-222222222222",
          dedupeHash: "other",
        },
        [],
      );
      expect(await store.leads.claimNotification("demo", now, true)).toBe(false);
      if (db) await db.close();
    });
    it("persists leads and attachments, filters, updates, analytics and drafts", async () => {
      const db = kind === "postgres" ? new PGlite() : null;
      if (db) await runMigrations((sql) => db.exec(sql));
      const store = db ? new PgStore(db) : new MemoryStore();
      await store.leads.create(lead, [
        {
          id: "a",
          leadId: lead.id,
          name: "x.jpg",
          contentType: "image/jpeg",
          data: new Uint8Array([255, 216, 255]),
          createdAt: time,
        },
      ]);
      expect((await store.leads.findByIdempotencyKey(lead.idempotencyKey))?.reference).toBe(
        lead.reference,
      );
      expect((await store.leads.findDuplicate("hash", 15, now))?.id).toBe(lead.id);
      expect(await store.leads.list({ serviceSlug: "panel-upgrades" })).toHaveLength(1);
      expect((await store.attachments.get("a"))?.contentType).toBe("image/jpeg");
      expect(await store.leads.updateStatus(lead.id, "contacted")).toBe(true);
      await store.leads.addEvent(lead.id, "status", "contacted");
      const claims = await Promise.all(
        Array.from({ length: 20 }, () => store.leads.claimNotification(lead.id, now)),
      );
      expect(claims.filter(Boolean)).toHaveLength(1);
      await store.leads.finishNotification(lead.id, "failed", "ProviderHttp500");
      expect((await store.leads.get(lead.id))?.notificationAttempts).toBe(1);
      expect(
        await store.leads.list({ notificationStatus: ["failed"], retryBefore: now }),
      ).toHaveLength(0);
      expect(
        await store.leads.list({
          notificationStatus: ["failed"],
          retryBefore: new Date(+now + 3600000),
        }),
      ).toHaveLength(1);
      await store.analytics.record({
        id: "event",
        type: "phone_click",
        page: "/",
        createdAt: time,
      });
      expect(
        (await store.analytics.countByType(new Date(+now - 60000), new Date(+now + 60000)))
          .phone_click,
      ).toBe(1);
      await store.aiSessions.create({
        id: "session",
        visitorHash: "visitor",
        month: "2026-10",
        startedAt: time,
        lastActivityAt: time,
        visitorMessages: 0,
        counted: false,
        reservationState: "none",
      });
      expect(await store.aiSessions.incrementMessages("session")).toBe(1);
      await store.aiDrafts.create({
        token: "draft",
        sessionId: "session",
        payload: { answer: 1 },
        expiresAt: new Date(+now + 60000).toISOString(),
      });
      const drafts = await Promise.all(
        Array.from({ length: 20 }, () => store.aiDrafts.consume("draft", "session", now)),
      );
      expect(drafts.filter(Boolean)).toHaveLength(1);
      expect(await store.attachments.purgeOlderThan(new Date(+now + 60000))).toBe(1);
      await db?.close();
    });
  });
