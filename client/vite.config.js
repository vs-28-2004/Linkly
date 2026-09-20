import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // In development the client calls relative /api/... URLs and Vite forwards them to the Express server.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
