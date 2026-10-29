import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { getPool } from "./pool";
export async function migrate(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    for (const name of (await readdir("lib/db/migrations"))
      .filter((name) => name.endsWith(".sql"))
      .sort()) {
      await client.query("BEGIN");
      try {
        await client.query("SELECT pg_advisory_xact_lock(781633141)");
        if (
          !(await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name])).rowCount
        ) {
          await client.query(await readFile(join("lib/db/migrations", name), "utf8"));
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
  }
}
