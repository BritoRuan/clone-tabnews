import { version as uuidVersion } from "uuid";
import orchestrator from "@/tests/orchestrator";
import user from "@/models/schemas/users/user";
import password from "@/models/schemas/password/password";

describe("POST /api/v1/users", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "maquina-o-tal-do-dinho",
          email: "ruan_maquinadinho111414@gmail.com",
          password: "senha12345",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        features: ["read:activation_token"],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      const userInDatabase = await user.findOneByUsername(
        "maquina-o-tal-do-dinho",
      );

      const correctPasswordMatch = await password.compare(
        "senha12345",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "SenhaErrada",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    it("With duplicated 'email'", async () => {
      const request1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "maquinadinho1",
          email: "duplicatedemail@gmail.com",
          password: "senha12345",
        }),
      });

      expect(request1.status).toBe(201);

      const request2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "maquinadinho2",
          email: "Duplicatedemail@gmail.com",
          password: "senha12345",
        }),
      });

      expect(request2.status).toBe(400);

      const responseBody = await request2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O e-mail informado já está sendo utilizado.",
        action: "Utilize outro e-mail para realizar esta operação.",
        status_code: 400,
      });
    });

    it("With duplicated 'username'", async () => {
      const request1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "maquinadinho4",
          email: "auduqgue1@gmail.com",
          password: "senha12345",
        }),
      });

      expect(request1.status).toBe(201);

      const request2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "maquinadinho4",
          email: "duagfyugsfygsf@gmail.com",
          password: "senha12345",
        }),
      });

      expect(request2.status).toBe(400);

      const responseBody = await request2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });
  });

  describe("Default user", () => {
    it("With unique and valid data", async () => {
      const user1 = await orchestrator.createUser({});
      await orchestrator.activateUser(user1.id);
      const user1SessionObject = await orchestrator.createSession(user1.id);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `sid=${user1SessionObject.token}`,
        },
        body: JSON.stringify({
          username: "loggeduser",
          email: "loggeduser1@gmail.com",
          password: "senha12345",
        }),
      });

      const user2ResponseBody = await user2Response.json();

      expect(user2Response.status).toBe(403);
      expect(user2ResponseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "create:user"',
        status_code: 403,
      });
    });
  });
});
