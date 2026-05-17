import orchestrator from "@/tests/orchestrator";
import { version as uuidVersion } from "uuid";
import session from "@/models/schemas/session/session";
import setCookieParser from "set-cookie-parser";

describe("POST /api/v1/sessions", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Default user", () => {
    it("With incorrect 'email' but correct 'password'", async () => {
      await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrong.email@gmail.com",
          password: "correct-password",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autentitação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    it("With correct 'email' but incorrect 'password'", async () => {
      await orchestrator.createUser({
        email: "correct.email@gmail.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct.email@gmail.com",
          password: "wrong-password",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autentitação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    it("With incorrect 'email' and incorrect 'password'", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrong.email0101@gmail.com",
          password: "wrong-password0101",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autentitação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    it("With correct 'email' and correct 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "everything-correct@gmail.com",
        password: "everythingcorrect",
      });

      await orchestrator.activateUser(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "everything-correct@gmail.com",
          password: "everythingcorrect",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt.getTime() - createdAt.getTime()).toBe(
        session.EXPIRATION_IN_MILLISECONDS,
      );

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.sid).toEqual({
        name: "sid",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
