import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const parsed = new URL(url);
const ssl =
  process.env.NODE_ENV !== "production" &&
  (["localhost", "127.0.0.1"].includes(parsed.hostname) ||
    parsed.searchParams.get("sslmode") === "disable")
    ? false
    : {
        rejectUnauthorized: true,
        ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : {}),
      };
parsed.searchParams.delete("sslmode");
const pool = new pg.Pool({ connectionString: parsed.toString(), ssl });
const client = await pool.connect();
try {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of (await fs.readdir("lib/db/migrations"))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await client.query("BEGIN");
    try {
      await client.query("SELECT pg_advisory_xact_lock(781633141)");
      if (
        !(await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name])).rowCount
      ) {
        await client.query(await fs.readFile(path.join("lib/db/migrations", name), "utf8"));
        await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [name]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  client.release();
  await pool.end();
}
