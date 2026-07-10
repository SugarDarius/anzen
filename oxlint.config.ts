import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import react from 'ultracite/oxlint/react'
import vitest from 'ultracite/oxlint/vitest'

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: core.ignorePatterns,
//   rules: {
//     'eslint/class-methods-use-this': 'off',
//     'eslint/func-style': 'off',
//     'eslint/max-classes-per-file': 'off',
//     'eslint/no-await-in-loop': 'off',
//     'eslint/no-warning-comments': 'off',
//     'jsx-a11y/click-events-have-key-events': 'off',
//     'jsx-a11y/no-noninteractive-element-interactions': 'off',
//     'jsx-a11y/prefer-tag-over-role': 'off',
//     'typescript/consistent-type-definitions': 'off',
//     'typescript/no-invalid-void-type': 'off',
//     'unicorn/catch-error-name': 'off',
//   },
})
