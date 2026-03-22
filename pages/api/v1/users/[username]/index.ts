import controller from "@/infra/controllers/controllers";
import user from "@/models/schemas/users/user";
import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const username = request.query.username as string;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}
