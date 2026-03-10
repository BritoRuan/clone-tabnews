import { NextApiRequest, NextApiResponse } from "next";
import { MethodNotAllowedError } from "../errors/MethodNotAllowedError";
import { InternalServerError } from "../errors/InternalServerError";

type PublicError = Error & {
  statusCode: number;
};

function isPublicError(error: Error): error is PublicError {
  return "statusCode" in error && typeof error.statusCode === "number";
}

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
  if (isPublicError(error)) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMoatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
