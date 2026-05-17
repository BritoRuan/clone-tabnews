import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import controller from "@/infra/controllers/controllers";
import user from "@/models/schemas/users/user";
import activation from "@/models/schemas/activation/activation";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken.id);

  return response.status(201).json(newUser);
}
