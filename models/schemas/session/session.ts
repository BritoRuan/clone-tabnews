import crypto from "node:crypto";
import database from "@/infra/database/database";
import { UnauthorizedError } from "@/infra/errors/UnauthorizedError";

const RANDOM_BYTES_LENGTH = 48;
const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

async function create(userId: string) {
  const token = await generateToken(RANDOM_BYTES_LENGTH);
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

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

async function findOneValidByToken(sessionToken: string) {
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
        message: "Usuário não possui sessão ativa",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
