import webserver from "@/infra/http/server/webserver";
import emailConfig from "@/infra/emails/config";
import activation from "@/models/schemas/activation/activation";
import user from "@/models/schemas/users/user";
import orchestrator from "@/tests/orchestrator";

describe("Registration Flow", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
    await orchestrator.deleteAllEmails();
  });

  describe("Use case: Registration Flow (all successful)", () => {
    let createUserResponseBody;
    let activationTokenId;
    let createSessionsResponseBody;
    it("Create user account", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "RegistrationFlow",
            email: "registration-flow@gmail.com",
            password: "senha12345",
          }),
        },
      );

      createUserResponseBody = await createUserResponse.json();

      expect(createUserResponse.status).toBe(201);
      expect(createUserResponseBody).toEqual({
        id: createUserResponseBody.id,
        username: "RegistrationFlow",
        features: ["read:activation_token"],
        created_at: createUserResponseBody.created_at,
        updated_at: createUserResponseBody.updated_at,
      });
    });

    it("Receive activation email", async () => {
      const lastEmail = await orchestrator.getLastEmail();

      expect(lastEmail.sender).toBe(`<${emailConfig.getFromEmail()}>`);
      expect(lastEmail.recipients[0]).toBe("<registration-flow@gmail.com>");
      expect(lastEmail.subject).toBe("Ative seu cadastro no TabNinos!");
      expect(lastEmail.text).toContain("RegistrationFlow");

      activationTokenId = orchestrator.extractUUID(lastEmail.text);

      expect(lastEmail.text).toContain(
        `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
      );

      const activationTokenObject =
        await activation.findOneValidById(activationTokenId);

      expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
      expect(activationTokenObject.used_at).toBe(null);
    });

    it("Active account", async () => {
      const activationResponse = await fetch(
        `http://localhost:3000/api/v1/activations/${activationTokenId}`,
        {
          method: "PATCH",
        },
      );

      expect(activationResponse.status).toBe(200);

      const activationResponseBody = await activationResponse.json();
      const activatedUser = await user.findOneByUsername("RegistrationFlow");

      expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
        "update:user",
      ]);
    });

    it("Login", async () => {
      const createSessionsResponse = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "registration-flow@gmail.com",
            password: "senha12345",
          }),
        },
      );

      createSessionsResponseBody = await createSessionsResponse.json();

      expect(createSessionsResponse.status).toBe(201);
      expect(createSessionsResponseBody.user_id).toBe(
        createUserResponseBody.id,
      );
    });

    it("Get user information", async () => {
      const userResponse = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${createSessionsResponseBody.token}`,
        },
      });

      const userResponseBody = await userResponse.json();

      expect(userResponse.status).toBe(200);
      expect(userResponseBody.id).toBe(createUserResponseBody.id);
    });
  });
});
