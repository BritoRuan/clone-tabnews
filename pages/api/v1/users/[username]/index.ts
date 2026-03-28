import controller from "@/infra/controllers/controllers";
import { ValidationError } from "@/infra/errors/ValidationError";
import user from "@/models/schemas/users/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.get(getHandler);
router.patch(patchHandler);

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

  const updatedUser = await user.update(username, userInputRequestValues);
  return response.status(200).json(updatedUser);
}
