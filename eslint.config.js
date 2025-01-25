const nextPlugin = require('@next/eslint-plugin-next');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
const nextPlugin = require('@next/eslint-plugin-next');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
];
