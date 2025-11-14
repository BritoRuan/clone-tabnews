import { defaultMigrationOptions } from "infra/database/migrations/default-migration-options";
import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from "node-pg-migrate";

export default async function migrations(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);

    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}
