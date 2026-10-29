import { getPool } from "./pool";
import { runMigrations } from "./run-migrations.mjs";
export async function migrate(): Promise<void> {
  const client = await getPool().connect();
  try {
    await runMigrations(client);
  } finally {
    client.release();
  }
}
