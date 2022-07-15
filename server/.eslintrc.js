module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest", // Allows the use of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the linting rules from @typescript-eslint/eslint-plugin
    "plugin:prettier/recommended",
  ],
  env: {
    node: true, // Enable Node.js global variables
  },
  plugins: ["prettier"],
  rules: {
    "no-console": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": ["off"],
    "prettier/prettier": ["error"],
  },
};
