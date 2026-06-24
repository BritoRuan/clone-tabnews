import controller from "@/infra/controllers/controllers";
import { ForbiddenError } from "@/infra/errors/ForbiddenError";
import { ValidationError } from "@/infra/errors/ValidationError";
import authorization from "@/models/schemas/authorization/authorization";
import user from "@/models/schemas/users/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<NextApiRequest, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .patch(controller.canRequest("update:user"), patchHandler)
  .handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const userTryingToGet = request.context.user;
  const username = request.query.username as string;
  const userFound = await user.findOneByUsername(username);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    userFound,
  );

  return response.status(200).json(secureOutputValues);
}

async function patchHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const username = request.query.username as string;
  const userInputRequestValues = request.body;

  if (
    !userInputRequestValues ||
    Object.keys(userInputRequestValues).length === 0
  ) {
    throw new ValidationError({
      message:
        "Para realizar esta requisição é necessário enviar pelo menos uma propriedade.",
      action: "Verifique o corpo desta requisição e tente novamente.",
    });
  }

  const userTryingToPatch = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    });
  }

  const updatedUser = await user.update(username, userInputRequestValues);

  const secureOutputValues = authorization.filterOutput(
    updatedUser,
    "read:user",
    updatedUser,
  );

  return response.status(200).json(secureOutputValues);
}
