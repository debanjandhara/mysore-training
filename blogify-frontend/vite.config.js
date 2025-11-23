import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'b56df1d3a1ee.ngrok-free.app'
    ]
  }
})
