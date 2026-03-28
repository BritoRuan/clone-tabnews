import { ValidationError } from "@/infra/errors/ValidationError";
import { UpdateUserRequest } from "@/models/schemas/users/types/requests/update-user-request.types";

export default function validateInputFields(input: UpdateUserRequest) {
  if ("username" in input && fieldIsBlank(input.username)) {
    throw new ValidationError({
      message: "O username informado não pode estar vazio.",
      action: "Informe um username válido para realizar a atualização.",
    });
  }
  if ("email" in input && fieldIsBlank(input.email)) {
    throw new ValidationError({
      message: "O email informado não pode estar vazio.",
      action: "Informe um email válido para realizar a atualização.",
    });
  }
  if ("password" in input && fieldIsBlank(input.password)) {
    throw new ValidationError({
      message: "A senha informada não pode estar vazia.",
      action: "Informe uma senha válida para realizar a atualização.",
    });
  }
}

function fieldIsBlank(value?: string) {
  return typeof value !== "string" || value.trim().length === 0;
}
