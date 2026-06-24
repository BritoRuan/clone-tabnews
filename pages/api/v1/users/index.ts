import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import controller from "@/infra/controllers/controllers";
import user from "@/models/schemas/users/user";
import activation from "@/models/schemas/activation/activation";
import authorization from "@/models/schemas/authorization/authorization";

export default createRouter<NextApiRequest, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest("create:user"), postHandler)
  .post(postHandler)
  .handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const userTryingToPost = request.context.user;
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken.id);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  );

  return response.status(201).json(secureOutputValues);
}
