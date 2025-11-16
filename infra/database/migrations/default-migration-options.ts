import { RunnerOption } from "node-pg-migrate";
import { join } from "node:path";

const isProduction = process.env.NODE_ENV === "production";

export const defaultMigrationOptions: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: isProduction
    ? join(process.cwd(), ".next", "server", "infra", "migrations")
    : join(process.cwd(), "infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: process.env.DATABASE_MIGRATIONS_TABLE,
};
