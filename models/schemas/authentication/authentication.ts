import { NotFoundError } from "@/infra/errors/NotFoundError";
import { UnauthorizedError } from "@/infra/errors/UnauthorizedError";
import { FindUserResponse } from "@/infra/types/users/find-user-response.types";
import password from "@/models/schemas/password/password";
import user from "@/models/schemas/users/user";

async function getUser(providedEmail: string, providedPassword: string) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autentitação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }
    throw error;
  }

  async function findUserByEmail(
    providedEmail: string,
  ): Promise<FindUserResponse> {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se este dado está correto.",
        });
      }

      throw error;
    }

    return storedUser;
  }

  async function validatePassword(
    providedPassword: string,
    storedPassword: string,
  ) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = {
  getUser,
};

export default authentication;
