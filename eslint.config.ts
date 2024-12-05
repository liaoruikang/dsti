import { Linter } from 'eslint';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default <Linter.Config[]>[
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['**/dist/', '**/node_modules/'] },
  {
    languageOptions: {
      globals: globals.es2016
    },
    rules: {
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  eslintConfigPrettier
];
