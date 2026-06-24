import webserver from "@/infra/http/server/webserver";
import orchestrator from "@/tests/orchestrator";
import { createMocks } from "node-mocks-http";
import handler from "pages/api/v1/migrations";

describe("POST /api/v1/migrations", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("should return an error when user does not have permission", async () => {
      const { req: request, res: response } = createMocks({
        method: "POST",
      });

      await handler(request, response);

      const responseBody = response._getJSONData();

      expect(response._getStatusCode()).toBe(403);
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action:
          'Verifique se o seu usuário possui a feature "create:migration"',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    it("running migrations", async () => {
      const user = await orchestrator.createUser({
        password: "senha12345",
      });
      await orchestrator.activateUser(user.id);
      const userSessionObject = await orchestrator.createSession(user.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `sid=${userSessionObject.token}`,
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe("Privileged user", () => {
    it("With `create:migration`", async () => {
      const user = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(user.id);
      const userSessionObject = await orchestrator.createSession(
        activatedUser.id,
      );

      await orchestrator.addFeaturesToUser(user.id, ["create:migration"]);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `sid=${userSessionObject.token}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
