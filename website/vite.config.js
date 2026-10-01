import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          const path = id.replace(/\\/g, '/')
          // react-router must be matched before react (it contains 'react')
          if (path.includes('node_modules/react-router')) return 'router'
          if (
            path.includes('node_modules/react-dom') ||
            path.includes('node_modules/scheduler') ||
            path.includes('node_modules/react/')
          ) return 'react-vendor'
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4001',
      '/uploads': 'http://localhost:4001',
    },
  },
})
