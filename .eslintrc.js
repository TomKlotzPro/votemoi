module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // You can customize rules here
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
