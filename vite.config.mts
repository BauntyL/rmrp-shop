import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  root: 'client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  plugins: [react(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});
