import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";

const asWarnings = (rules = {}) =>
  Object.fromEntries(
    Object.entries(rules).map(([rule, setting]) => [
      rule,
      Array.isArray(setting) ? ["warn", ...setting.slice(1)] : "warn",
    ]),
  );

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      ".pnpm-store/**",
      ".playwright-cli/**",
      "public/**",
      "src/data/templates/**",
    ],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        __APP_CONFIG__: "readonly",
        __INTERACTIVE_ASSET_VERSION__: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-uses-vars": "warn",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-useless-escape": "warn",
      "no-case-declarations": "warn",
      "no-cond-assign": "warn",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-useless-catch": "warn",
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: [
      "src/features/training-admin/**/*.{js,jsx}",
      "src/components/layout/{Header,AdminLayout,Layout}.jsx",
      "src/components/training/**/*.jsx",
      "src/components/common/AppErrorBoundary.jsx",
    ],
    plugins: {
      react,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...asWarnings(jsxA11y.configs.recommended.rules),
      "jsx-a11y/label-has-for": "off",
      "react/jsx-uses-vars": "warn",
    },
  },
  {
    files: ["vite.config.js", "vitest.config.mjs", "eslint.config.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
