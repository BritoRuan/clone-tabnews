import controller from "@/infra/controllers/controllers";
import activation from "@/models/schemas/activation/activation";
import authorization from "@/models/schemas/authorization/authorization";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<NextApiRequest, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .patch(controller.canRequest("read:activation_token"), patchHandler)
  .handler(controller.errorHandlers);

async function patchHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const userTryingToPatch = request.context.user;
  const activationTokenId = request.query.token_id as string;

  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedActivationToken,
  );

  return response.status(200).json(secureOutputValues);
}
