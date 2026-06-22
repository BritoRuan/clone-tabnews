import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import controller from "@/infra/controllers/controllers";
import migrator from "@/models/migrator";
import authorization from "@/models/schemas/authorization/authorization";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.post(controller.canRequest("create:migration"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(_request: NextApiRequest, response: NextApiResponse) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(
  _request: NextApiRequest,
  response: NextApiResponse,
) {
  const userTryingToPost = _request.context.user;
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "create:migration",
    migratedMigrations,
  );

  return response.status(200).json(secureOutputValues);
}
