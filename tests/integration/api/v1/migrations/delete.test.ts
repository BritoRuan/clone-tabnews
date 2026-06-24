import webserver from "@/infra/http/server/webserver";
import orchestrator from "@/tests/orchestrator";

describe("DELETE /api/v1/migrations", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
  });

  describe("Anonymous user", () => {
    describe("Trying to make a request using the delete method.", () => {
      it("should return an error when using DELETE method", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "DELETE",
        });

        const responseBody = await response.json();

        expect(response.status).toBe(405);
        expect(responseBody).toEqual({
          name: "MethodNotAllowedError",
          message: "Método não permitido para este endpoint.",
          action:
            "Verifique se o método HTTP enviado é válido para este endpoint.",
          status_code: 405,
        });
      });
    });
  });
});
