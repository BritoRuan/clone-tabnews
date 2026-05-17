import { StatusCode } from "../types/StatusCode";

type ValidationErrorParams = {
  cause?: unknown;
  message?: string;
  action?: string;
};

export class ForbiddenError extends Error {
  statusCode = StatusCode.FORBIDDEN;
  action?: string;

  constructor({ cause, message, action }: ValidationErrorParams = {}) {
    super(message || "Acesso negado.", {
      cause,
    });
    this.name = "ForbiddenError";
    this.action =
      action || "Verifique as features necessárias antes de continuar.";
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
