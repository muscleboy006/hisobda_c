import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Use the external manifest file instead of inlining it
      manifest: false,
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      // Point to the external manifest
      manifestFilePath: 'public/manifest.json'
    })
  ],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // ← важно для доступности извне
    allowedHosts: ['.ngrok-free.app'], // wildcard поддоменов ngrok
  },
})