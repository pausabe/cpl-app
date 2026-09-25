// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  // Formatting is Prettier's job: drop the style rules that would fight with it
  prettierConfig,
  {
    ignores: ['android/', 'ios/', 'dist/', '.expo/', 'migration-to-saints/'],
  },
  {
    // The React Compiler rules (eslint-plugin-react-hooks 7), as warnings: the app does not use
    // it, and the older code was not written with it in mind
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/use-memo': 'warn',
    },
  },
  {
    files: ['__tests__/**'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      // The tests reach into the modules they mock (jest.mock) from outside
      'import/namespace': 'off',
      'react/display-name': 'off',
    },
  },
]);
