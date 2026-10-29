import { getPool } from "@/lib/db/pool";
import { allowsDemoMemory, getServerEnv } from "@/lib/config/env";
import { parsedClientConfig } from "@/config/client.config";
import { MemoryStore } from "./memory-store";
import { PgStore, type Db, type DbQuery } from "./pg-store";
import type { Store } from "./types";
import type { PoolClient, Pool } from "pg";
// globalThis: Next bundles route handlers and pages separately; one store per process, not per bundle.
const shared = globalThis as typeof globalThis & { __electricianStore?: Store };
function queryAdapter(client: Pool | PoolClient): DbQuery {
  return {
    query: async <T>(sql: string, params?: unknown[]) => ({
      rows: (await client.query(sql, params)).rows as T[],
    }),
  };
}
export function getStore(): Store {
  if (process.env.NODE_ENV === "production") getServerEnv();
  let store = shared.__electricianStore;
  if (!store) {
    if (process.env.DATABASE_URL) {
      const pool = getPool();
      const db: Db = {
        ...queryAdapter(pool),
        transaction: async <T>(fn: (db: DbQuery) => Promise<T>) => {
          const client = await pool.connect();
          let discard = false;
          try {
            await client.query("BEGIN");
            const value = await fn(queryAdapter(client));
            await client.query("COMMIT");
            return value;
          } catch (error) {
            try {
              await client.query("ROLLBACK");
            } catch {
              discard = true;
            }
            throw error;
          } finally {
            client.release(discard);
          }
        },
      };
      store = new PgStore(db);
    } else store = new MemoryStore(true);
    shared.__electricianStore = store;
  }
  if (
    process.env.NODE_ENV === "production" &&
    ((!process.env.DATABASE_URL && !allowsDemoMemory(parsedClientConfig, process.env)) ||
      (store instanceof MemoryStore &&
        (!!process.env.DATABASE_URL || !allowsDemoMemory(parsedClientConfig, process.env))))
  )
    throw new Error("Production requires a database store");
  return store;
}
