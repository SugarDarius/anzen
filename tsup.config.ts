import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: {
    /**
     * Ignore deprecations for TypeScript 6+
     * 👉🏻 workaround to fix the build error with TypeScript 6+ when getting the deprecation error:
     *   - "error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error."
     *   - https://github.com/egoist/tsup/issues/1388
     */
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  entry: ['src/index.ts', 'src/server-components/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  splitting: true,
})
