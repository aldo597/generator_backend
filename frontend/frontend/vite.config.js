import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/generator/',
  server: {
    proxy: {
      // Proxy alle Anfragen, die mit /wochen beginnen ans Backend weiterleiten
      '/wochen': {
        target: 'https://generator-vz7r.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      // ggf. weitere Endpunkte wie /tage, /punkte auch hier
      '/tage': {
        target: 'https://generator-vz7r.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/punkte': {
        target: 'https://generator-vz7r.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/bild': {
        target: 'https://generator-vz7r.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
