import { StatusCode } from "../types/StatusCode";

type ValidationErrorParams = {
  cause?: unknown;
  message?: string;
  action?: string;
};

export class NotFoundError extends Error {
  statusCode = StatusCode.NOT_FOUND;
  action?: string;

  constructor({ cause, message, action }: ValidationErrorParams = {}) {
    super(message || "Não foi possível encontrar este recurso no sistema.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action || "Verifique se os parâmetros enviados na consulta estão certos.";
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
