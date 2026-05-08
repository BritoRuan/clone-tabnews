import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import controller from "@/infra/controllers/controllers";
import user from "@/models/schemas/users/user";
import activation from "@/models/schemas/activation/activation";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  // 1. Criar o Token de Ativação
  await activation.sendEmailToUser(newUser);

  return response.status(201).json(newUser);
}
