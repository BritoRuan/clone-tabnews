import controller from "@/infra/controllers/controllers";
import authentication from "@/models/schemas/authentication/authentication";
import session from "@/models/schemas/session/session";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.post(postHandler);

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
