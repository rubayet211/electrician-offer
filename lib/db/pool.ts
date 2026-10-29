import { Pool } from "pg";
import { databaseSsl } from "./ssl.mjs";
export { databaseSsl };
// globalThis: Next bundles route handlers and pages separately; one pool per process, not per bundle.
const shared = globalThis as typeof globalThis & { __electricianPool?: Pool };
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  let pool = shared.__electricianPool;
  if (!pool) {
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.delete("sslmode");
    pool = new Pool({
      connectionString: url.toString(),
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      statement_timeout: 10000,
      ssl: databaseSsl(process.env.DATABASE_URL, process.env.DATABASE_CA_CERT),
    });
    pool.on("error", (error) =>
      console.error(JSON.stringify({ event: "pool_error", errorClass: error.name })),
    );
    shared.__electricianPool = pool;
  }
  return pool;
}
