/** @jest-config-loader ts-node */
import dotenv from "dotenv";
import type { Config } from "jest";
import nextJest from "next/jest.js";

dotenv.config({
  path: ".env.development",
});

const createJestConfig = nextJest({
  dir: "./",
});

const jestConfig: Config = {
  moduleDirectories: ["node_modules", "<rootDir>"],
};

export default createJestConfig(jestConfig);
