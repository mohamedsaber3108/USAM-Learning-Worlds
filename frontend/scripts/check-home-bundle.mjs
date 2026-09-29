#!/usr/bin/env node
/**
 * Home-bundle perf gate (task #16).
 *
 * Asserts that the initial (Home) load does NOT pull in the heavy coding
 * runtime. Concretely: after `vite build`, the generated dist/index.html must
 * NOT contain a <link rel="modulepreload"> (or entry <script>) for the coding
 * vendor chunks (Sandpack / CodeMirror / Pyodide). Those are only needed inside
 * the lazy mission/coding routes and must load on demand, not on Home.
 *
 * Run AFTER `npm run build`. Exits non-zero (fails the gate) if any forbidden
 * chunk is eagerly referenced by index.html.
 *
 * Usage:  node scripts/check-home-bundle.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const indexHtmlPath = resolve(root, 'dist/index.html')

if (!existsSync(indexHtmlPath)) {
  console.error('✗ dist/index.html not found — run `npm run build` first.')
  process.exit(2)
}

const html = readFileSync(indexHtmlPath, 'utf8')

// Chunk-name substrings that must NOT be eagerly referenced by Home.
const FORBIDDEN = ['vendor-sandpack', 'vendor-codemirror', 'vendor-pyodide']

// All asset JS references in index.html (entry <script> + modulepreload links).
const refs = [...html.matchAll(/assets\/[^"']+\.js/g)].map((m) => m[0])
const offenders = refs.filter((ref) => FORBIDDEN.some((f) => ref.includes(f)))

if (offenders.length > 0) {
  console.error('✗ HOME BUNDLE REGRESSION — coding runtime is eagerly loaded on Home:')
  for (const o of offenders) console.error(`    ${o}`)
  console.error(
    '\n  These chunks must be reachable only through the lazy mission/coding\n' +
      '  routes. Check vite.config.ts build.modulePreload.resolveDependencies\n' +
      '  and that Sandpack/Blockly/CodeMirror are lazy-imported.',
  )
  process.exit(1)
}

console.log('✔ Home bundle clean — no coding runtime (sandpack/codemirror/pyodide) eagerly loaded.')
console.log(`  (${refs.length} eager JS refs checked in dist/index.html)`)
