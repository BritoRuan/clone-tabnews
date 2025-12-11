import orchestrator from "@/tests/orchestrator";
import { createMocks } from "node-mocks-http";
import handler from "pages/api/v1/migrations";

describe("POST /api/v1/migrations", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
  });

  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      it("For the first time", async () => {
        const { req: firstRequest, res: firstResponse } = createMocks({
          method: "POST",
        });

        await handler(firstRequest, firstResponse);

        const firstResponseBody = firstResponse._getJSONData();

        expect(firstResponse._getStatusCode()).toBe(201);
        expect(Array.isArray(firstResponseBody)).toBe(true);
        expect(firstResponseBody.length).toBeGreaterThan(0);
      });

      it("For the second time", async () => {
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
  });
});
