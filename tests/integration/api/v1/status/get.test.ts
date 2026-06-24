import webserver from "@/infra/http/server/webserver";
import orchestrator from "@/tests/orchestrator";

describe("GET to /api/v1/status", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
  });
  describe("Anonymous user", () => {
    it("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

      expect(response.status).toBe(200);
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
      expect(responseBody).toEqual({
        updated_at: parsedUpdatedAt,
        dependencies: {
          database: {
            max_connections: responseBody.dependencies.database.max_connections,
            opened_connections:
              responseBody.dependencies.database.opened_connections,
          },
        },
      });
    });
  });

  describe("Privileged user", () => {
    it("With `read:status:all`", async () => {
      const privilegedUser = await orchestrator.createUser({});
      const activatedprivilegedUser = await orchestrator.activateUser(
        privilegedUser.id,
      );

      await orchestrator.addFeaturesToUser(privilegedUser.id, [
        "read:status:all",
      ]);

      const privilegedUserSession = await orchestrator.createSession(
        activatedprivilegedUser.id,
      );

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `sid=${privilegedUserSession.token}`,
        },
      });

      const responseBody = await response.json();
      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.dependencies.database.version).toEqual("16.0");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
      expect(responseBody).toEqual({
        updated_at: parsedUpdatedAt,
        dependencies: {
          database: {
            version: responseBody.dependencies.database.version,
            max_connections: responseBody.dependencies.database.max_connections,
            opened_connections:
              responseBody.dependencies.database.opened_connections,
          },
        },
      });
    });
  });
});
