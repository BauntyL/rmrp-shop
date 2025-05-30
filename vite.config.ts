import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  root: 'client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  }
})
