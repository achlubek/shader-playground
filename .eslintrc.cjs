module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "plugin:react/recommended",
  ],
  "settings": {
    "react": {
      "version": "detect",
    },
  },
  plugins: ["@typescript-eslint/eslint-plugin", "import", "react", "prettier"],
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "tsconfig.json",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  rules: {
    "prettier/prettier": "error",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    'react/react-in-jsx-scope': 'off',
    semi: ["off"],
    eqeqeq: "error",
    quotes: "off",
    "prefer-const": "error",
    "no-console": "error",
    "linebreak-style": ["error", "unix"],
    "comma-dangle": ["warn", "only-multiline"],
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true },
    ],
    "@typescript-eslint/no-explicit-any": 1,
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-member-accessibility": ["error"],
    "no-restricted-imports": ["error", { patterns: ["./*", "../*"] }],
    "@typescript-eslint/no-inferrable-types": [
      "warn",
      {
        ignoreParameters: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    // "@typescript-eslint/member-ordering": ["error"],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: [
          "classProperty",
          "parameter",
          "typeProperty",
          "parameterProperty",
          "classMethod",
          "objectLiteralMethod",
          "typeMethod",
          "accessor",
        ],
        format: ["camelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: [
          "function",
          "variable",
        ],
        format: ["PascalCase", "camelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: [
          "class",
          "interface",
          "enum",
          "enumMember",
          "typeAlias",
          "typeParameter",
        ],
        format: ["PascalCase"],
      },
    ],
  },
  ignorePatterns: [".eslintrc.js", "tsconfig*.json"],
};
