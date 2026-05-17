import { RequestUser } from "@/infra/types/next/next";
import { ResourceRequest } from "./types/resource.request.types";

function can(user: RequestUser, feature: string, resource?: ResourceRequest) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
