import { createRouter } from "next-connect";
import { defaultMigrationOptions } from "@/infra/database/migrations/default-migration-options";
import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from "node-pg-migrate";
import database from "@/infra/database/database";
import controller from "@/infra/controllers/controllers";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(_request: NextApiRequest, response: NextApiResponse) {
  const client = await database.getNewClient();
  try {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      noLock: true,
      dbClient: client,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    client.end();
  }
}

async function postHandler(
  _request: NextApiRequest,
  response: NextApiResponse,
) {
  const client = await database.getNewClient();

  try {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient: client,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    client.end();
  }
}
