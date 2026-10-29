import { getPool } from "@/lib/db/pool";
import { getServerEnv } from "@/lib/config/env";
import { MemoryStore } from "./memory-store";
import { PgStore, type Db, type DbQuery } from "./pg-store";
import type { Store } from "./types";
import type { PoolClient, Pool } from "pg";
let store: Store | undefined;
function queryAdapter(client: Pool | PoolClient): DbQuery {
  return {
    query: async <T>(sql: string, params?: unknown[]) => ({
      rows: (await client.query(sql, params)).rows as T[],
    }),
  };
}
export function getStore(): Store {
  if (process.env.NODE_ENV === "production") getServerEnv();
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
    } else store = new MemoryStore();
  }
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.DATABASE_URL || store instanceof MemoryStore)
  )
    throw new Error("Production requires a database store");
  return store;
}
