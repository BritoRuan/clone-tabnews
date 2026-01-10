import { defaultMigrationOptions } from "@/infra/database/migrations/default-migration-options";
import database from "@/infra/database/database";
import migrationRunner from "node-pg-migrate";

async function listPendingMigrations() {
  const client = await database.getNewClient();

  try {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      noLock: true,
      dbClient: client,
    });

    return pendingMigrations;
  } finally {
    client.end();
  }
}

async function runPendingMigrations() {
  const client = await database.getNewClient();

  try {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient: client,
    });

    return migratedMigrations;
  } finally {
    client.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
