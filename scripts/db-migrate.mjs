import pg from "pg";
import { databaseSsl } from "../lib/db/ssl.mjs";
import { runMigrations } from "../lib/db/run-migrations.mjs";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const parsed = new URL(url);
parsed.searchParams.delete("sslmode");
const pool = new pg.Pool({
  connectionString: parsed.toString(),
  ssl: databaseSsl(url, process.env.DATABASE_CA_CERT),
});
const client = await pool.connect();
try {
  await runMigrations(client);
} finally {
  client.release();
  await pool.end();
}
