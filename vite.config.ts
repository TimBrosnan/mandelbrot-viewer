import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/mandelbrot-viewer/' : '/',
  server: {
    port: 3001,
    host: true,
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})