module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: false },
  env: { node: true, es2022: true },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  },
  ignorePatterns: ['dist/**', 'config/**/*.cjs', 'migrations/**', 'seeders/**']
};
