// @ts-check

import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import jest from 'eslint-plugin-jest'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
  // DOC: https://typescript-eslint.io/getting-started#additional-configs
  // ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: ['reports']
  },
  {
    files: ['scripts/**/*.zx.js'],
    globals: {
      $: true,
      fs: true
    }
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked]
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn' // 'warn'
    }
  },
  // DOC: https://www.npmjs.com/package/eslint-plugin-jest
  {
    files: ['test/**', 'setup-jest.js'],
    ...jest.configs['flat/recommended']
  }
)