import { RunnerOption } from "node-pg-migrate";
import { resolve } from "node:path";

export const defaultMigrationOptions: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: resolve(process.cwd(), process.env.MIGRATIONS_DIR),
  direction: "up",
  log: () => {},
  migrationsTable: process.env.DATABASE_MIGRATIONS_TABLE,
};
