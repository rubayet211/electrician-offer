import type { PoolClient } from "pg";
export function runMigrations(client: PoolClient): Promise<void>;
