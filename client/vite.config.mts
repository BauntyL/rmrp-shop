import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Определяем, находимся ли мы в production
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: isProduction 
          ? 'https://autocatalog-production.up.railway.app'
          : 'http://localhost:3001',
        changeOrigin: true,
        secure: true
      }
    }
  },
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['wouter']
        }
      }
    },
    copyPublicDir: true
  },
  base: ''
})