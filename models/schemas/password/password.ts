import bcryptjs from "bcryptjs";
import validatePassword from "@/models/validators/password/validate-input-field-password";

async function hash(password: string) {
  validatePassword(password);
  const rounds = getNumberOfRounds();
  const pepper = getPepper();
  return await bcryptjs.hash(password + pepper, rounds);
}

async function compare(providedPassword: string, storedPassword: string) {
  const pepper = getPepper();
  return await bcryptjs.compare(providedPassword + pepper, storedPassword);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function getPepper() {
  return process.env.PASSWORD_PEPPER;
}

const password = {
  hash,
  compare,
};

export default password;
