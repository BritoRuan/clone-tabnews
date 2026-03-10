import { NextApiRequest, NextApiResponse } from "next";
import { MethodNotAllowedError } from "../errors/MethodNotAllowedError";
import { InternalServerError } from "../errors/InternalServerError";
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
  if (error instanceof ValidationError) {
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
