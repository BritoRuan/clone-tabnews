import controller from "@/infra/controllers/controllers";
import authentication from "@/models/schemas/authentication/authentication";
import session from "@/models/schemas/session/session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}

async function deleteHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const sessionToken = request.cookies.sid;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expiresById(sessionObject.id);

  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}
