import type { FindUserResponse } from "../users/find-user-response.types";

type AnonymousUser = {
  features: string[];
};

export type RequestUser = FindUserResponse | AnonymousUser;

declare module "next" {
  // eslint-disable-next-line no-unused-vars
  interface NextApiRequest {
    context?: {
      user?: RequestUser;
    };
  }
}

export {};
