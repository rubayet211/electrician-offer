import { Pool } from "pg";
import { databaseSsl } from "./ssl.mjs";
export { databaseSsl };
let pool: Pool | undefined;
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
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
  }
  return pool;
}
