import { RunnerOption } from "node-pg-migrate";
import { join } from "node:path";

const isProduction = process.env.NODE_ENV === "production";
const migrationsDir = isProduction
  ? join(process.cwd(), ".next", "server", "infra", "migrations")
  : join(process.cwd(), "dist", "infra", "migrations");

export const defaultMigrationOptions: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: migrationsDir,
  direction: "up",
  verbose: true,
  migrationsTable: process.env.DATABASE_MIGRATIONS_TABLE,
};
