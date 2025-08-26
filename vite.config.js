import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'home/ug2002056/public_html',
    emptyOutDir: true,
    assetsDir: 'assets'
  },
  server: {
    port: 18561,
    host: '0.0.0.0',
    strictPort: true
  },
  preview: {
    port: 18561,
    host: '0.0.0.0',
    strictPort: true
  }
})
