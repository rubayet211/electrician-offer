import { readdir, readFile } from "node:fs/promises";

export async function runMigrations(execute: (sql: string) => Promise<unknown>) {
  const directory = "lib/db/migrations";
  for (const file of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
    await execute(await readFile(`${directory}/${file}`, "utf8"));
  }
}
