module.exports = {
  extends: [
    "standard",
    "prettier",
    "plugin:react/recommended",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["react", "standard", "jest"],
  env: {
    node: true,
    commonjs: true,
    browser: true,
    es6: true,
    "shared-node-browser": true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "module",
    babelOptions: {
      configFile: "./babel.config.js",
    },
  },
  rules: {
    "max-len": ["warn", { code: 120 }],
    "prettier/prettier": 0,
    "at-rule-no-unknown": 0,
    "at-rule-no-unknown": 0,
    "at-import-partial-extension": 0,
  },
  settings: {
    react: {
      version: "16.2",
    },
  },
};
