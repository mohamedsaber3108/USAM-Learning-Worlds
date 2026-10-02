/// <reference types="vitest/config" />
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
// Optional base path for staged verification under a subpath (e.g. /preview/).
// Normal production build stays at root '/'. Set USAM_BASE=/preview/ to stage.
const BASE = process.env.USAM_BASE || '/'

export default defineConfig({
  base: BASE,
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
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
