import { RequestUser } from "@/infra/types/next/next";

function can(user: RequestUser, feature: string) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
