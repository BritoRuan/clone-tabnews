import controller from "@/infra/controllers/controllers";
import authorization from "@/models/schemas/authorization/authorization";
import session from "@/models/schemas/session/session";
import user from "@/models/schemas/users/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

export default createRouter<NextApiRequest, NextApiResponse>()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:session"), getHandler)
  .handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const userTryingToGet = request.context.user;
  const sessionToken = request.cookies.sid;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);

  controller.setSessionCookie(renewedSessionObject.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user:self",
    userFound,
  );

  return response.status(200).json(secureOutputValues);
}
