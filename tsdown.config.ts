import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  treeshake: true,
  minify: true,
  target: 'es2022',
  clean: true,
  publint: true,
});
