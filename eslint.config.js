// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  // El format és cosa de Prettier: fora les regles d'estil que s'hi barallarien
  prettierConfig,
  {
    ignores: ['android/', 'ios/', 'dist/', '.expo/', 'migration-to-saints/'],
  },
  {
    // Les regles del React Compiler (eslint-plugin-react-hooks 7), com a avís: l'app no el fa
    // servir, i el codi d'abans no hi estava pensat
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
      // Els tests canvien els mòduls simulats (jest.mock) des de fora
      'import/namespace': 'off',
      'react/display-name': 'off',
    },
  },
]);
