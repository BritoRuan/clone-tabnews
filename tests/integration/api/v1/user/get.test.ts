import session from "@/models/schemas/session/session";
import orchestrator from "@/tests/orchestrator";
import setCookieParser from "set-cookie-parser";
import { version as uuidVersion } from "uuid";

describe("GET /api/v1/user", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("Retrieving the endpoint", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user");

      const responseBody = await response.json();

      expect(response.status).toBe(403);
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:session"',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    it("With valid sessions", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const activatedUser = await orchestrator.activateUser(createdUser.id);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${sessionObject.token}`,
        },
      });

      const cacheControl = response.headers.get("Cache-Control");

      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        features: ["create:session", "read:session"],
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: activatedUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Sessions renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.sid).toEqual({
        name: "sid",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    it("With noexistent session", async () => {
      const noexistentToken =
        "d5c2382d81b092bedc46295a64eccba4b9c749f7dd4a13a72af75114c64e34634b47b769db60f8cea90e6c361ac52d72";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${noexistentToken}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.sid).toEqual({
        name: "sid",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    it("With exipired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.sid).toEqual({
        name: "sid",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    it("With session at expiration boundary", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - (session.EXPIRATION_IN_MILLISECONDS - 3600000),
        ),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserSessionAlmostExpired",
      });

      const activatedUser = await orchestrator.activateUser(createdUser.id);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `sid=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();
      expect(response.status).toBe(200);

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserSessionAlmostExpired",
        email: createdUser.email,
        features: ["create:session", "read:session"],
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: activatedUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Sessions renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.sid).toEqual({
        name: "sid",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
