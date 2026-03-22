import { StatusCode } from "../types/StatusCode";

type ValidationErrorParams = {
  cause?: unknown;
  message?: string;
  action?: string;
};

export class ValidationError extends Error {
  statusCode = StatusCode.BAD_REQUEST;
  action?: string;

  constructor({ cause, message, action }: ValidationErrorParams = {}) {
    super(message || "Um erro de validação ocorreu.", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Ajuste os dados enviados e tente novamente";
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
