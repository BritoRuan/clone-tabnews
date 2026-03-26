import bcryptjs from "bcryptjs";

async function hash(password: string) {
  const rounds = await getNumberOfRounds();
  const salt = await bcryptjs.genSalt(rounds);
  return await bcryptjs.hash(password, salt);
}

async function compare(providedPassword: string, storedPassword: string) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

async function getNumberOfRounds(): Promise<number> {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

const password = {
  hash,
  compare,
};

export default password;
