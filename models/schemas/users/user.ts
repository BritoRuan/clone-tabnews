import database from "@/infra/database/database";
import { NotFoundError } from "@/infra/errors/NotFoundError";
import { ValidationError } from "@/infra/errors/ValidationError";
import validateInputFields from "@/models/validators/users/validate-input-fields-users";
import { FindUserResponse } from "../../../infra/types/users/find-user-response.types.js";
import password from "../password/password";
import { CreateUserPasswordHashedRequest } from "./types/requests/create-user-password-hashed-request.types";
import { CreateUserRequest } from "./types/requests/create-user-request.types";
import { CreateUserResponse } from "./types/requests/create-user-response.types";
import { UpdateUserRequest } from "./types/requests/update-user-request.types";

async function findOneById(id: string): Promise<FindUserResponse> {
  const userFound = await runSelectQuery(id);
  return userFound;

  async function runSelectQuery(id: string) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        id = $1
      LIMIT
        1
      ;`,
      values: [id],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O id informado não foi encontrado no sistema.",
        action: "Verifique se o id está digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

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

async function findOneByEmail(email: string): Promise<FindUserResponse> {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email: string) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O e-mail informado não foi encontrado no sistema.",
        action: "Verifique se o e-mail está digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

async function create(input: CreateUserRequest): Promise<CreateUserResponse> {
  await validateUniqueUsername(input.username);
  await validateUniqueEmail(input.email);
  await hashPasswordInObject(input);
  injectDefaultFeaturesInObject(input);

  const newUser = await runInsertQuery(input);
  return newUser;

  async function runInsertQuery(input: CreateUserRequest) {
    const results = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password, features)
      VALUES 
        ($1, $2, $3, $4)
      RETURNING
        *
      ;`,
      values: [input.username, input.email, input.password, input.features],
    });

    return results.rows[0];
  }

  function injectDefaultFeaturesInObject(input: CreateUserRequest) {
    input.features = ["read:activation_token"];
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

async function setFeatures(userId: string, features: string[]) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId: string, features: string[]) {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        features = $2,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  findOneByEmail,
  update,
  setFeatures,
};

export default user;
