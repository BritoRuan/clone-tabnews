import controller from "@/infra/controllers/controllers";
import { ForbiddenError } from "@/infra/errors/ForbiddenError";
import { ValidationError } from "@/infra/errors/ValidationError";
import authorization from "@/models/schemas/authorization/authorization";
import user from "@/models/schemas/users/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const username = request.query.username as string;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
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
  return response.status(200).json(updatedUser);
}
