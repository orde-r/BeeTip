import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/transactions': 'http://localhost:3000',
    },
  },
})
