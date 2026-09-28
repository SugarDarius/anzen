import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    /** Main entry point. */
    'src/index.ts',
    /** Server components entry point. */
    'src/server-components/index.ts',
  ],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  sourcemap: true,
  target: false,
})
