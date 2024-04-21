import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/jobs': 'http://localhost:8000',
      '/internships': 'http://localhost:8000',
      '/companies': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/messages': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    }
  },
})
