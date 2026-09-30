import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// USAM rebuild — clean Vite config.
//
// Bundle-splitting lesson carried over from the legacy frontend (do NOT
// regress): the coding runtime (Sandpack/Pyodide/CodeMirror/Blockly) must be
// dynamically imported by the coding surfaces only and must NEVER be manual-
// chunked, because naming those vendor chunks made Rollup hoist Vite's shared
// preload helper into them, dragging ~950kB of coding runtime into the Home
// load graph. Leave them unnamed so they co-locate with the lazy coding chunks
// and load only when a coding activity mounts. A perf gate re-asserts this.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
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
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          // Heavy shared libs get their own cached vendor chunks.
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('@tanstack/react-query')) return 'vendor-query'
          if (id.includes('i18next')) return 'vendor-i18n'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react'
          }
          // Coding runtime intentionally UNNAMED — see file header.
          return 'vendor'
        },
      },
    },
  },
})
