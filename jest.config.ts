/** @jest-config-loader ts-node */
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import type { Config } from "jest";
import nextJest from "next/jest.js";

const myEnvs = dotenv.config({
  path: ".env.development",
});

dotenvExpand.expand(myEnvs);

const createJestConfig = nextJest({
  dir: "./",
});

const jestConfig: Config = {
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(jestConfig);
