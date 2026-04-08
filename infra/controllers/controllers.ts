import session from "@/models/schemas/session/session";
import * as cookie from "cookie";
import { NextApiRequest, NextApiResponse } from "next";
import { InternalServerError } from "../errors/InternalServerError";
import { MethodNotAllowedError } from "../errors/MethodNotAllowedError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ValidationError } from "../errors/ValidationError";

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
    error instanceof UnauthorizedError
  ) {
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

const controller = {
  errorHandlers: {
    onNoMatch: onNoMoatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
