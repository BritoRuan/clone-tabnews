import email from "@/infra/emails/emails";
import { SendEmailToUserRequest } from "./types/send-email-to-user.request.types";
import database from "@/infra/database/database";
import webserver from "@/infra/http/server/webserver";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId: string) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId: string, expiresAt: Date) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        values
          ($1, $2)
        RETURNING
          *
        ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOneByUserId(userId: string) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT 
          1
      ;`,
      values: [userId],
    });

    return results.rows[0];
  }
}

async function sendEmailToUser(
  input: SendEmailToUserRequest,
  activationToken: string,
) {
  await email.send({
    from: "TabNinos <tabninos+mailcatcher@gmail.com>",
    to: input.email,
    subject: "Ative seu cadastro no TabNinos!",
    text: `${input.username}, clique no link abaixo para ativar seu cadastro no TabNinos:
    
${webserver.origin}/cadastro/ativar/${activationToken}

Atenciosamente, 
Equipe TabNinos`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
};

export default activation;
