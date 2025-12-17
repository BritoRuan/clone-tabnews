import { RunnerOption } from "node-pg-migrate";

export const defaultMigrationOptions: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: false,
  dir: process.env.MIGRATIONS_DIR ?? "dist/infra/migrations",
  direction: "up",
  verbose: true,
  migrationsTable: process.env.DATABASE_MIGRATIONS_TABLE,
};
