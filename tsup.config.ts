import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/server-components/index.ts'],
  dts: true,
  splitting: true,
  clean: true,
  format: ['esm', 'cjs'],
  sourcemap: true,
})
