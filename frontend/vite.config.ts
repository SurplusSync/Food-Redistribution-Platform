import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 0.0.0.0 is crucial. It tells Vite to listen on ALL network interfaces,
    // not just localhost inside the container.
    host: '0.0.0.0', 
    port: 5173,
    // This ensures Docker maps the port correctly every time
    strictPort: true, 
    watch: {
      usePolling: true, // Essential for Windows Docker to detect code changes
    },
  },
})