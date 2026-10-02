/**
 * Home-bundle perf gate (ported concept from the proven legacy guard).
 *
 * Asserts the coding runtime (Pyodide/Sandpack/Blockly/CodeMirror) is NOT
 * pulled into the entry/index chunk — it must load only when a CODE activity
 * mounts (via the lazy CodingActivityPanel). Runs against the built dist/.
 * Fails the build (exit 1) if the coding runtime leaks into the eager graph.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ASSETS = join(process.cwd(), 'dist', 'assets')
const CODING_MARKERS = ['pyodide', 'sandpack', 'codemirror', 'blockly']

let entryFiles = []
try {
  entryFiles = readdirSync(ASSETS).filter((f) => f.startsWith('index-') && f.endsWith('.js'))
} catch {
  console.error('check:home-bundle — dist/assets not found. Run build first.')
  process.exit(1)
}

let leaked = false
for (const file of entryFiles) {
  const content = readFileSync(join(ASSETS, file), 'utf8').toLowerCase()
  for (const marker of CODING_MARKERS) {
    if (content.includes(marker)) {
      console.error(`check:home-bundle — FAIL: entry chunk ${file} contains "${marker}" (coding runtime leaked).`)
      leaked = true
    }
  }
}

if (leaked) process.exit(1)
console.log('check:home-bundle — OK: no coding runtime in the entry chunk.')
