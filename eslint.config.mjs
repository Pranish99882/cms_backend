import { defineConfig } from 'eslint';

export default defineConfig({
  languageOptions: {
    globals: {
      browser: 'readonly',
      node: 'readonly',
      es2021: true, // or 'readonly' if you want to explicitly mark ES2021 globals
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'no-console': 'warn',
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
});
