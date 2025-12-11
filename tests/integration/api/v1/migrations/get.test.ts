import database from "infra/database/database";
import handler from "pages/api/v1/migrations";
import { createMocks } from "node-mocks-http";
import orchestrator from "@/tests/orchestrator";

async function resetDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

describe("GET /api/v1/migrations", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
  });

  beforeAll(async () => {
    await resetDatabase();
  });
  describe("Anonymous user", () => {
    it("Running pending migrations", async () => {
      const { req: request, res: response } = createMocks({
        method: "GET",
      });

      await handler(request, response);

      const responseBody = response._getJSONData();

      expect(response._getStatusCode()).toBe(200);
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
