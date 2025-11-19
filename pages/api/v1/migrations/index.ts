import { defaultMigrationOptions } from "@/infra/database/migrations/default-migration-options";
import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from "node-pg-migrate";
import database from "@/infra/database/database";

export default async function migrations(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const allowedMethod = ["GET", "POST"];

  if (!allowedMethod.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`,
    });
  }
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        noLock: true,
        dbClient: dbClient,
      });

      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
        dbClient: dbClient,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient.end();
  }
}
