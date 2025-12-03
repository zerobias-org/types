import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

/**
 * Shared ESLint configuration for all packages in this monorepo.
 * Based on @auditmation/eslint-config with platform-style overrides.
 */
export default [
  eslintPluginUnicorn.configs.all,
  {
    files: ['**/src/**/*.ts', '**/test/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        // Mocha globals
        after: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        xit: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // General rules
      'class-methods-use-this': 'off',
      'no-await-in-loop': 'off',
      'no-template-curly-in-string': 'off',
      'object-curly-newline': 'off',
      'no-return-await': 'off',
      'function-paren-newline': 'off',
      'function-call-argument-newline': 'off',
      'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
      'max-len': ['error', { code: 150 }],

      // Unicorn overrides - match platform config
      'unicorn/better-regex': 'warn',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-keyword-prefix': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/no-empty-file': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/consistent-destructuring': 'off',
      'unicorn/prefer-array-some': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'unicorn/prefer-string-raw': 'off',

      // Types-specific overrides (not in platform since errors are defined here)
      'unicorn/custom-error-definition': 'off',
    },
  },
  {
    ignores: ['**/dist/**', '**/generated/**', '**/node_modules/**'],
  },
];
