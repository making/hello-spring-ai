import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/vanilla': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/datetime': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/mcp': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/clear': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/messages': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
