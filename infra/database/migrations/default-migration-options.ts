import { RunnerOption } from "node-pg-migrate";
import { join } from "node:path";

export const defaultMigrationOptions: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: join(process.cwd(), process.env.MIGRATIONS_DIR!),
  direction: "up",
  verbose: true,
  migrationsTable: process.env.DATABASE_MIGRATIONS_TABLE,
};
