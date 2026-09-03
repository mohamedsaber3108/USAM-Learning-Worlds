import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Heavy, shared vendor libraries are pulled into many lazy-loaded
        // routes (motion is used by 20+ pages, sandpack/pyodide by every
        // coding mission). Splitting them into their own vendor chunks
        // means the browser fetches/caches them once instead of them
        // being duplicated into (or bloating) each route's own chunk.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('framer-motion')) return 'vendor-motion'

          if (
            id.includes('@codemirror') ||
            id.includes('@lezer') ||
            id.includes('codemirror')
          ) {
            return 'vendor-codemirror'
          }
          if (
            id.includes('@codesandbox/sandpack-react') ||
            id.includes('@codesandbox/sandpack-client')
          ) {
            return 'vendor-sandpack'
          }
          if (id.includes('pyodide')) return 'vendor-pyodide'

          if (id.includes('date-fns')) return 'vendor-date'
          if (id.includes('recharts')) return 'vendor-recharts'

          if (id.includes('lucide-react')) return 'vendor-icons'

          if (id.includes('i18next')) return 'vendor-i18n'

          if (id.includes('react-router')) return 'vendor-router'

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react'
          }

          if (id.includes('@tanstack/react-query')) return 'vendor-query'

          return 'vendor'
        },
      },
    },
  },
})
