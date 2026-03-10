import database from "@/infra/database/database";
import { UserInputValues } from "./types/user-input-values.types";
import { ValidationError } from "@/infra/errors/ValidationError";

async function create(input: UserInputValues) {
  await validateUniqueEmail(input.email);
  await validateUniqueUsername(input.username);

  const newUser = await runInsertQuery(input);
  return newUser;

  async function validateUniqueEmail(email: string) {
    const results = await database.query({
      text: `
      SELECT 
        email 
      FROM
       users 
      WHERE 
        LOWER(email) = LOWER($1)
        `,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O e-mail informado já está sendo utilizado.",
        action: "Utilize outro e-mail para realizar o cadastro.",
      });
    }
  }

  async function validateUniqueUsername(username: string) {
    const results = await database.query({
      text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      `,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
      });
    }
  }

  async function runInsertQuery(input: UserInputValues) {
    const results = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password)
      VALUES 
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [input.username, input.email, input.password],
    });

    return results.rows[0];
  }
}

const user = {
  create,
};

export default user;
