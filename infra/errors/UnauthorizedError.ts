import { StatusCode } from "../types/StatusCode";

type ValidationErrorParams = {
  cause?: unknown;
  message?: string;
  action?: string;
};

export class UnauthorizedError extends Error {
  statusCode = StatusCode.UNAUTHORIZED;
  action?: string;

  constructor({ cause, message, action }: ValidationErrorParams = {}) {
    super(message || "Usuário não autenticado.", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action || "Faça novamente o login para continuar";
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
