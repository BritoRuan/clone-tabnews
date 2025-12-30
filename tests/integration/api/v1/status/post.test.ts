import orchestrator from "@/tests/orchestrator";

describe("POST to /api/v1/status", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
  });
  describe("Anonymous user", () => {
    it("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
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
