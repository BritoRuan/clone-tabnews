import database from "@/infra/database/database";
import webserver from "@/infra/http/server/webserver";
import migrator from "@/models/migrator";
import session from "@/models/schemas/session/session";
import user from "@/models/schemas/users/user";
import { faker } from "@faker-js/faker";
import retry from "async-retry";
import { CreateUserRequest } from "./integration/types/users/requests/create-user-request.type";
import activation from "@/models/schemas/activation/activation";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServices();
  await waitForEmailServices();

  async function waitForWebServices() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserver.origin}/api/v1/status`);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }

  async function waitForEmailServices() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);

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
    features: input.features,
  });
}

async function createSession(userId: string) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) return null;

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );

  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

function extractUUID(text: string) {
  const match = text.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : null;
}

async function activateUser(id: string) {
  return await activation.activateUserByUserId(id);
}

async function addFeaturesToUser(userId: string, features: string[]) {
  const updatedUser = await user.addFeatures(userId, features);
  return updatedUser;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
  activateUser,
  addFeaturesToUser,
};

export default orchestrator;
