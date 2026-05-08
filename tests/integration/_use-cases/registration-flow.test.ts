import orchestrator from "@/tests/orchestrator";

describe("Registration Flow", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
    await orchestrator.deleteAllEmails();
  });

  describe("Use case: Registration Flow (all successful)", () => {
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

      const createUserResponseBody = await createUserResponse.json();

      expect(createUserResponse.status).toBe(201);
      expect(createUserResponseBody).toEqual({
        id: createUserResponseBody.id,
        username: "RegistrationFlow",
        email: "registration-flow@gmail.com",
        features: ["read:activation_token"],
        password: createUserResponseBody.password,
        created_at: createUserResponseBody.created_at,
        updated_at: createUserResponseBody.updated_at,
      });
    });
  });
});
