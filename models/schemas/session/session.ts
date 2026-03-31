import crypto from "node:crypto";
import database from "@/infra/database/database";

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

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
