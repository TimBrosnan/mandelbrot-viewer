import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mandelbrot-viewer/',
  server: {
    host: true,
    port: 3001,
    strictPort: true,
    open: true // This will automatically open the browser
  }
}) 