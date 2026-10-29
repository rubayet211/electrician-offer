import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";
import { MemoryStore } from "@/lib/store/memory-store";
for (const kind of ["memory", "postgres"] as const) {
  describe(`${kind} store contract`, () => {
    it("limits concurrent quota reservations and rate hits", async () => {
      const db = kind === "postgres" ? new PGlite() : null;
      if (db) await db.exec(await readFile("lib/db/migrations/001_init.sql", "utf8"));
      const store = db ? new PgStore(db) : new MemoryStore();
      const results = await Promise.all(
        Array.from({ length: 50 }, () => store.aiUsage.reserve("2026-10", 10)),
      );
      expect(results.filter(Boolean)).toHaveLength(10);
      const hits = await Promise.all(
        Array.from({ length: 20 }, () => store.rateLimit.hit("visitor", 5, 600000)),
      );
      expect(hits.filter((hit) => hit.allowed)).toHaveLength(5);
      await db?.close();
    });
  });
}
