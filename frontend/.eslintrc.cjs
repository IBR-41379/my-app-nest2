/* eslint-env node */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  env: { browser: true, es2022: true, node: true },
  extends: ["eslint:recommended", "plugin:react-hooks/recommended", "prettier"],
  settings: {},
  rules: {
    "no-console": "warn"
  },
  ignorePatterns: ["dist", "coverage"]
};
