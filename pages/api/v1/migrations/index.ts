import { NextApiRequest, NextApiResponse } from "next";
import migrationRunner from 'node-pg-migrate'
import { join } from 'node:path'

export default async function migrations(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === "GET") {
    const migrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: true,
      dir: join(process.cwd(), "dist", "infra", "migrations"),
      direction: 'up',
      verbose: true,
      migrationsTable: 'pgmigrations',
    });

    return response.status(200).json(migrations);
  }

  if (request.method === 'POST') {
    const migrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: false,
      dir: join(process.cwd(), "dist", "infra", "migrations"),
      direction: 'up',
      verbose: true,
      migrationsTable: 'pgmigrations',
    });

    return response.status(200).json(migrations);
  }

  return response.status(405).end();
}
