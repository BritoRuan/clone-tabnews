import { ValidationError } from "@/infra/errors/ValidationError";

export default function validatePassword(password: string) {
  if (fieldIsBlank(password)) {
    throw new ValidationError({
      message: "A senha informada não pode estar vazia.",
      action: "Informe uma senha válida para continuar.",
    });
  }
}

function fieldIsBlank(value?: string) {
  return typeof value !== "string" || value.trim().length === 0;
}
