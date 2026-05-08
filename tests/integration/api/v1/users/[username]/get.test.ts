import orchestrator from "@/tests/orchestrator";

describe("GET /api/v1/users/[username]", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("With exact case match'", async () => {
      await orchestrator.createUser({
        username: "SameCase",
        email: "same.case@gmail.com",
        password: "senha12345",
      });

      const request2 = await fetch(
        "http://localhost:3000/api/v1/users/SameCase",
      );

      const responseBody = await request2.json();

      expect(request2.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "SameCase",
        email: "same.case@gmail.com",
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    it("With case mismatch'", async () => {
      await orchestrator.createUser({
        username: "NoSameCase",
        email: "no.same.case@gmail.com",
        password: "senha12345",
      });

      const request2 = await fetch(
        "http://localhost:3000/api/v1/users/Nosamecase",
      );

      const responseBody = await request2.json();

      expect(request2.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "NoSameCase",
        email: "no.same.case@gmail.com",
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    it("With noexistent username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/noexistentusername",
      );

      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
