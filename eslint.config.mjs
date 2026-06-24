import js from "@eslint/js";
import css from "@eslint/css";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import globals from "globals";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import jestPlugin from "eslint-plugin-jest";

const codeFiles = ["**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}"];
const nextConfigs = nextCoreWebVitals.map((config) =>
  config.files || config.ignores ? config : { ...config, files: codeFiles },
);
const markdownRecommended = markdown.configs.recommended.map((config) => ({
  ...config,
  language: "markdown/gfm",
}));

const eslintConfig = [
  {
    ignores: ["node_modules/**", "dist/**", "infra/migrations/**", ".next/**"],
  },
  {
    ...js.configs.recommended,
    files: codeFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...nextConfigs,
  {
    ...jestPlugin.configs["flat/recommended"],
    files: ["tests/**/*.{js,jsx,ts,tsx}"],
  },
  {
    ...json.configs.recommended,
    files: ["**/*.json"],
    language: "json/json",
  },
  {
    ...json.configs.recommended,
    files: ["**/*.jsonc"],
    language: "json/jsonc",
  },
  {
    ...json.configs.recommended,
    files: ["**/*.json5"],
    language: "json/json5",
  },
  {
    files: ["package-lock.json"],
    rules: {
      "json/no-empty-keys": "off",
    },
  },
  ...markdownRecommended,
  {
    ...css.configs.recommended,
    files: ["**/*.css"],
    language: "css/css",
  },
  prettier,
];

export default eslintConfig;
