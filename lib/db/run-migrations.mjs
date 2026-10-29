import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
const directory = fileURLToPath(new URL("./migrations/", import.meta.url));
export async function runMigrations(client) {
  await client.query("SELECT pg_advisory_lock(781633141)");
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    for (const name of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
      await client.query("BEGIN");
      try {
        if (
          !(await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name])).rowCount
        ) {
          await client.query(await readFile(join(directory, name), "utf8"));
          await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [name]);
        }
        await client.query("COMMIT");
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {}
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(781633141)");
  }
}
