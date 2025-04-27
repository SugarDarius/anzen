import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter[]} */
export default [
  ...tseslint.config(eslint.configs.recommended, tseslint.configs.recommended),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_.*',
          varsIgnorePattern: '^_.*',
        },
      ],
    },
  },
]
