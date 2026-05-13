import session from "@/models/schemas/session/session";
import user from "@/models/schemas/users/user";
import * as cookie from "cookie";
import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { InternalServerError } from "../errors/InternalServerError";
import { MethodNotAllowedError } from "../errors/MethodNotAllowedError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ValidationError } from "../errors/ValidationError";
import { ForbiddenError } from "../errors/ForbiddenError";

function onNoMoatchHandler(
  _request: NextApiRequest,
  response: NextApiResponse,
) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
  error: Error,
  _request: NextApiRequest,
  response: NextApiResponse,
) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(
  sessionToken: string,
  response: NextApiResponse,
) {
  const setCookie = cookie.serialize("sid", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(response: NextApiResponse) {
  const setCookie = cookie.serialize("sid", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(
  request: NextApiRequest,
  response: NextApiResponse,
  next: NextHandler,
) {
  if (request.cookies?.sid) {
    await injectAuthenticatedUser(request);
    return next();
  }

  injectAnonymousUser(request);
  return next();
}

async function injectAuthenticatedUser(request: NextApiRequest) {
  const sessionToken = request.cookies.sid;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userObject = await user.findOneById(sessionObject.user_id);

  request.context = {
    ...request.context,
    user: userObject,
  };
}

function injectAnonymousUser(request: NextApiRequest) {
  const anonymousUserObject = {
    features: ["read:activation_token", "create:session", "create:user"],
  };

  request.context = {
    ...request.context,
    user: anonymousUserObject,
  };
}

function canRequest(feature: string) {
  return function canRequestMiddleware(
    request: NextApiRequest,
    response: NextApiResponse,
    next: NextHandler,
  ) {
    const userTryingToRequest = request.context.user;

    if (userTryingToRequest.features.includes(feature)) {
      return next();
    }

    throw new ForbiddenError({
      message: "Você não possui permissão para executar esta ação.",
      action: `Verifique se o seu usuário possui a feature ${feature}`,
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMoatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  canRequest,
};

export default controller;
