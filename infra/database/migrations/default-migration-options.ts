import { RunnerOption } from "node-pg-migrate";
import { join } from "node:path";

export const defaultMigrationOptions: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: false,
  dir: join(process.cwd(), "infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: process.env.DATABASE_MIGRATIONS_TABLE ?? "pgmigrations",
};
