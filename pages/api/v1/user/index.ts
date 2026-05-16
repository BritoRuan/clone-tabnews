import controller from "@/infra/controllers/controllers";
import session from "@/models/schemas/session/session";
import user from "@/models/schemas/users/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const sessionToken = request.cookies.sid;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);

  controller.setSessionCookie(renewedSessionObject.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return response.status(200).json(userFound);
}
