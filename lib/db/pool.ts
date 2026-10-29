import { Pool } from "pg";
export function databaseSsl(url: string, ca?: string, nodeEnv = process.env.NODE_ENV) {
  const parsed = new URL(url);
  if (
    nodeEnv !== "production" &&
    (["localhost", "127.0.0.1"].includes(parsed.hostname) ||
      parsed.searchParams.get("sslmode") === "disable")
  )
    return false;
  return { rejectUnauthorized: true as const, ...(ca ? { ca } : {}) };
}
let pool: Pool | undefined;
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!pool) {
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.delete("sslmode");
    pool = new Pool({
      connectionString: url.toString(),
      ssl: databaseSsl(process.env.DATABASE_URL, process.env.DATABASE_CA_CERT),
    });
  }
  return pool;
}
