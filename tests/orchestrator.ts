import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "@/infra/database/database";
import migrator from "@/models/migrator";
import user from "@/models/schemas/users/user";
import { CreateUserRequest } from "./integration/types/users/requests/create-user-request.type";

async function waitForAllServices() {
  await waitForWebServices();

  async function waitForWebServices() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(input: CreateUserRequest) {
  return await user.create({
    username: input.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: input.email || faker.internet.email(),
    password: input.password || "validpassword",
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
