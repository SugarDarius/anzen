import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**'],
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    typecheck: { enabled: true },
  },
})
