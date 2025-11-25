import orchestrator from "@/tests/orchestrator";
import database from "infra/database/database";
import { createMocks } from "node-mocks-http";
import handler from "pages/api/v1/migrations";

async function resetDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

describe("POST /api/v1/migrations", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
  });

  beforeAll(async () => {
    await resetDatabase();
  });

  test("should apply migrations on first call and return empty list on second call", async () => {
    const { req: firstRequest, res: firstResponse } = createMocks({
      method: "POST",
    });

    await handler(firstRequest, firstResponse);

    const firstResponseBody = firstResponse._getJSONData();

    expect(firstResponse._getStatusCode()).toBe(201);
    expect(Array.isArray(firstResponseBody)).toBe(true);
    expect(firstResponseBody.length).toBeGreaterThan(0);

    const { req: secondRequest, res: secondResponse } = createMocks({
      method: "POST",
    });

    await handler(secondRequest, secondResponse);

    const secondResponseBody = secondResponse._getJSONData();

    expect(secondResponse._getStatusCode()).toBe(200);
    expect(Array.isArray(secondResponseBody)).toBe(true);
    expect(secondResponseBody.length).toBe(0);
  });
});
