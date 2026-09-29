#!/usr/bin/env node
/**
 * Home-bundle perf gate (task #16).
 *
 * Asserts the initial (Home) load does NOT pull in the heavy coding runtime
 * (CodeMirror / Sandpack / Pyodide). Those belong only to the lazy
 * mission/coding chunks and must load on demand.
 *
 * Checks TWO things after `vite build`:
 *  1. dist/index.html has no eager <script>/<link modulepreload> for a coding
 *     chunk.
 *  2. The ENTRY chunk (index-*.js) does not STATICALLY import a coding library.
 *     This catches the subtle regression the Playwright network test found: a
 *     symbol-level static import (e.g. Vite's preload helper hoisted into the
 *     sandpack chunk) that dragged the whole coding runtime into the entry
 *     graph while leaving index.html looking clean.
 *
 * Run AFTER `npm run build`. Exits non-zero on regression.
 * The authoritative runtime proof is e2e/home.spec.ts (real browser trace);
 * this is the cheap deterministic gate that runs without browser binaries.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')
const indexHtmlPath = resolve(distDir, 'index.html')
const assetsDir = resolve(distDir, 'assets')

if (!existsSync(indexHtmlPath) || !existsSync(assetsDir)) {
  console.error('✗ dist not found — run `npm run build` first.')
  process.exit(2)
}

// Library name fragments that identify the coding runtime, matched against
// both chunk filenames and chunk contents.
const CODING = ['sandpack', 'codemirror', 'pyodide', '@codesandbox']

const html = readFileSync(indexHtmlPath, 'utf8')
const problems = []

// 1) index.html must not eagerly reference a coding-named chunk.
const htmlRefs = [...html.matchAll(/assets\/[^"']+\.js/g)].map((m) => m[0])
for (const ref of htmlRefs) {
  if (CODING.some((c) => ref.toLowerCase().includes(c))) {
    problems.push(`index.html eagerly references a coding chunk: ${ref}`)
  }
}

// 2) The entry chunk must not statically import a coding library.
const entry = readdirSync(assetsDir).find((f) => /^index-.*\.js$/.test(f))
if (!entry) {
  console.error('✗ could not find entry index-*.js in dist/assets.')
  process.exit(2)
}
const entryCode = readFileSync(resolve(assetsDir, entry), 'utf8')
// Look only at static import specifiers to avoid matching unrelated strings.
const entryImports = [...entryCode.matchAll(/from\s*["']([^"']+)["']/g)].map((m) => m[1])
for (const spec of entryImports) {
  if (CODING.some((c) => spec.toLowerCase().includes(c))) {
    problems.push(`entry chunk (${entry}) statically imports a coding chunk: ${spec}`)
  }
}
// Also scan raw entry for the lib identifiers as a backstop.
for (const c of CODING) {
  if (entryCode.toLowerCase().includes(c)) {
    problems.push(`entry chunk (${entry}) contains coding-runtime identifier: "${c}"`)
  }
}

if (problems.length > 0) {
  console.error('✗ HOME BUNDLE REGRESSION — coding runtime is in the Home load graph:')
  for (const p of [...new Set(problems)]) console.error(`    ${p}`)
  console.error(
    '\n  The coding runtime (Sandpack/CodeMirror/Pyodide) must load only through\n' +
      '  the lazy mission/coding chunks. Check that SandpackMission/BlocklyWorkspace\n' +
      '  are lazy-imported and NOT manual-chunked in vite.config.ts. Re-run e2e/home.spec.ts.',
  )
  process.exit(1)
}

console.log('✔ Home bundle clean — coding runtime absent from index.html + entry chunk.')
console.log(`  (checked ${htmlRefs.length} index.html refs + entry ${entry})`)
