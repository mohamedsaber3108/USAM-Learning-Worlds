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

          // NOTE: the coding runtime (CodeMirror, Sandpack, Pyodide) is
          // deliberately NOT manual-chunked. Forcing it into named vendor
          // chunks made Rollup hoist Vite's shared __vitePreload helper into
          // the sandpack chunk, which the ENTRY then statically imported —
          // dragging ~950kB of coding runtime into the Home load graph (proven
          // in a real browser by e2e/home.spec.ts, invisible to the static
          // index.html check). Leaving them unnamed lets Rollup co-locate them
          // with the lazy MissionPlayer/coding chunks that dynamically import
          // them (CodeMissionRunner lazy-imports SandpackMission/Blockly), so
          // they load ONLY when a coding mission mounts. Verified: Home fetches
          // no vendor-sandpack/codemirror/pyodide. Do not re-add these groups
          // without re-running the E2E network assertion.
          if (id.includes('pyodide')) return undefined

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
