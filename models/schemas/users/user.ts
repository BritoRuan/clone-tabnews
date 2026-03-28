import database from "@/infra/database/database";
import { CreateUserRequest } from "./types/requests/create-user-request.types";
import { ValidationError } from "@/infra/errors/ValidationError";
import { NotFoundError } from "@/infra/errors/NotFoundError";
import password from "../password/password";
import { FindUserResponse } from "./types/responses/find-user-response.types.js";
import { CreateUserResponse } from "./types/requests/create-user-response.types";
import { UpdateUserRequest } from "./types/requests/update-user-request.types";
import validateInputFields from "@/models/validators/users/validate-input-fields-users";
import { CreateUserPasswordHashedRequest } from "./types/requests/create-user-password-hashed-request.types";

async function findOneByUsername(username: string): Promise<FindUserResponse> {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username: string) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

async function create(input: CreateUserRequest): Promise<CreateUserResponse> {
  await validateUniqueUsername(input.username);
  await validateUniqueEmail(input.email);
  await hashPasswordInObject(input);

  const newUser = await runInsertQuery(input);
  return newUser;

  async function runInsertQuery(input: CreateUserRequest) {
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

async function update(username: string, input: UpdateUserRequest) {
  const currentUser = await findOneByUsername(username);
  validateInputFields(input);

  if (
    "username" in input &&
    username.toLowerCase() !== input.username.toLowerCase()
  ) {
    await validateUniqueUsername(input.username);
  }

  if ("email" in input) {
    await validateUniqueEmail(input.email);
  }

  if ("password" in input) {
    await hashPasswordInObject(input);
  }

  const userWithNewValues = { ...currentUser, ...input };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValue: UpdateUserRequest) {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      `,
      values: [
        userWithNewValue.id,
        userWithNewValue.username,
        userWithNewValue.email,
        userWithNewValue.password,
      ],
    });

    return results.rows[0];
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
      ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email: string) {
  const results = await database.query({
    text: `
      SELECT 
        email 
      FROM
       users 
      WHERE 
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O e-mail informado já está sendo utilizado.",
      action: "Utilize outro e-mail para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(input: CreateUserPasswordHashedRequest) {
  const hashedPassword = await password.hash(input?.password);
  input.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
