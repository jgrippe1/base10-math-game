import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for GitHub Pages — repo is served at /base10-math-game/
  base: '/base10-math-game/',
  build: {
    // Konva is ~500kb minified — suppress the expected chunk size warning
    chunkSizeWarningLimit: 700,
  },
})
