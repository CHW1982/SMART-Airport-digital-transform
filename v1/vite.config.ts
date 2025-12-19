import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set base to './' so that the built HTML uses relative paths.
  // This allows the app to run when opened directly from a file system or inside Electron.
  base: './',
})