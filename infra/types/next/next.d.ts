import type { FindUserResponse } from "../users/find-user-response.types";

type AnonymousUser = {
  id?: string;
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
