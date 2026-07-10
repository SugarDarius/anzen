import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import react from 'ultracite/oxlint/react'
import vitest from 'ultracite/oxlint/vitest'

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      files: ['**/*.{test,spec}.{ts,tsx}'],
      plugins: ['vitest'],
      rules: {
        'vitest/max-expects': 'off',
        'vitest/no-conditional-expect': 'off',
      },
    },
  ],
  rules: {
    'eslint/class-methods-use-this': 'off',
    'eslint/complexity': 'off',
    'eslint/default-case': 'off',
    'eslint/func-style': 'off',
    'eslint/max-classes-per-file': 'off',
    'eslint/no-empty-function': 'off',
    'eslint/no-inline-comments': 'off',
    'eslint/no-nested-ternary': 'off',
    'eslint/no-throw-literal': 'off',
    'eslint/no-warning-comments': 'off',
    'eslint/require-await': 'off',
    'eslint/require-unicode-regexp': 'off',
    'react/button-has-type': 'off',
    'typescript/consistent-type-definitions': 'off',
    'typescript/no-invalid-void-type': 'off',
    'typescript/no-namespace': 'off',
    'unicorn/catch-error-name': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-array-sort': 'off',
    'unicorn/no-nested-ternary': 'off',
  },
})
