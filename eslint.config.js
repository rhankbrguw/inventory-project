import js from "/tmp/eslint-setup/node_modules/@eslint/js/src/index.js";
import unusedImports from "/tmp/eslint-setup/node_modules/eslint-plugin-unused-imports/dist/index.js";
import react from "/tmp/eslint-setup/node_modules/eslint-plugin-react/index.js";
import reactHooks from "/tmp/eslint-setup/node_modules/eslint-plugin-react-hooks/index.js";

export default [
  js.configs.recommended,
  {
    files: ["resources/js/**/*.{js,jsx}"],
    plugins: {
      "unused-imports": unusedImports,
      "react": react,
      "react-hooks": reactHooks,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
      "no-unused-vars": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
];
