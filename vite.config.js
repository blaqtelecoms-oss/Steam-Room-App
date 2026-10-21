import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [react()],
  server: process.env.BASE44_PREVIEW_MODE === '1'
    ? { host: '0.0.0.0', port: 3000, allowedHosts: true, strictPort: true }
    : undefined,
});
