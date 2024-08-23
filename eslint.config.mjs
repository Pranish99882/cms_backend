// import globals from "globals";
// import pluginJs from "@eslint/js";
// import tseslint from "typescript-eslint";

// export default [
//   { files: ["**/*.{ts}"] },
//   { languageOptions: { globals: globals.browser } },
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
// ];


import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["dist/", "node_modules/"], // Ignore these directories
  },
  {
    files: ["src/**/*.{ts,tsx}"], // Target TypeScript files
    languageOptions: {
      parser: tsParser, // Use TypeScript parser
      sourceType: "module", // Use ES module syntax
      globals: globals.node, // Node.js globals
    },
    plugins: {
      "@typescript-eslint": tsPlugin, // TypeScript plugin
      prettier, // Prettier plugin
      "import": importPlugin, // Import plugin
    },
    rules: {
      ...js.configs.recommended.rules, // ESLint recommended rules
      ...tsPlugin.configs.recommended.rules, // TypeScript ESLint recommended rules
      "prettier/prettier": "warn", // Enforce Prettier formatting
      "@typescript-eslint/ban-ts-comment": "warn", // Warn about @ts-ignore comments
      "@typescript-eslint/no-require-imports": "warn", // Allow require() imports
      "@typescript-eslint/no-explicit-any": "off", // Allow usage of `any` type

      "import/order": [
        "warn",
        {
          "groups": ["builtin", "external", "internal"],
          "newlines-between": "always",
          "pathGroups": [
            {
              "pattern": "**/*.ts",
              "group": "internal",
              "position": "after"
            },
            {
              "pattern": "**/*.tsx",
              "group": "internal",
              "position": "after"
            }
          ],
          "pathGroupsExcludedImportTypes": [],
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "none", // Ignore unused function arguments
          ignoreRestSiblings: true, // Ignore unused variables in destructuring
        },
      ],
    },
  },
  prettierConfig, // Prettier and other configurations
];
