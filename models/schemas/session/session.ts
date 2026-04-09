import crypto from "node:crypto";
import database from "@/infra/database/database";
import { UnauthorizedError } from "@/infra/errors/UnauthorizedError";
import { FindOneValidByTokenResponse } from "./types/find-one-valid-by-token-response.types";
import { CreateSessionRequest } from "./types/create-session-request.types";

const RANDOM_BYTES_LENGTH = 48;
const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

async function create(userId: string): Promise<CreateSessionRequest> {
  const token = await generateToken(RANDOM_BYTES_LENGTH);
  const expiresAt = generateExpiresAtDate(EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(
    token: string,
    userId: string,
    expiresAt: Date,
  ) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function generateToken(bytesLength: number) {
  return crypto.randomBytes(bytesLength).toString("hex");
}

async function findOneValidByToken(
  sessionToken: string,
): Promise<FindOneValidByTokenResponse> {
  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(sessionToken: string) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT
        1
      ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function renew(sessionId: string) {
  const expiresAt = generateExpiresAtDate(EXPIRATION_IN_MILLISECONDS);
  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);

  return renewedSessionObject;

  async function runUpdateQuery(sessionId: string, expiresAt: Date) {
    const results = await database.query({
      text: `
      UPDATE
        sessions
      SET
        expires_at = $2,
        updated_at = NOW()
      WHERE 
        id = $1
      RETURNING
        * 
      ;`,
      values: [sessionId, expiresAt],
    });

    return results.rows[0];
  }
}

async function expiresById(sessionId: string) {
  const expiredSessionObject = runUpdateQuery(sessionId);
  return expiredSessionObject;

  async function runUpdateQuery(sessionId: string) {
    const results = await database.query({
      text: `
      UPDATE
        sessions
      SET
        expires_at = expires_at - interval '1 year',
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        * 
      ;`,
      values: [sessionId],
    });

    return results.rows[0];
  }
}

function generateExpiresAtDate(dateInNumber: number) {
  const expiresAt = new Date(Date.now() + dateInNumber);
  return expiresAt;
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expiresById,
  generateExpiresAtDate,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
