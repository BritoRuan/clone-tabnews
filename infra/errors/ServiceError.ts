import { StatusCode } from "../types/StatusCode";

type ValidationErrorParams = {
  cause?: unknown;
  message?: string;
  action?: string;
  context?: string;
};

export class ServiceError extends Error {
  statusCode = StatusCode.SERVICE_UNAVAILABLE;
  action?: string;
  context?: string;

  constructor({ cause, message, action, context }: ValidationErrorParams = {}) {
    super(message || "Serviço indisponível no momento.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = action || "Verifique se o serviço está disponível.";
    this.context = context;
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
