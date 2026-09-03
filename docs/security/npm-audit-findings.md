# NPM Audit Security Review

Branch: `agent-backend-security-audit-v1`
Scope: `backend/` and `frontend/` npm dependency audit.

## Backend (`backend/`)

**Before:** 36 vulnerabilities (4 low, 17 moderate, 14 high, 1 critical)
**After `npm audit fix` (applied, non-breaking):** 29 vulnerabilities (4 low, 16 moderate, 8 high, 1 critical)

`npm audit fix` was run (safe fixes only, no `--force`). It resolved several
high-severity dev-dependency chains without any `package.json` version bumps
(only `package-lock.json` transitive resolutions changed). `npm run build`
(`nest build`) passes cleanly after the fix.

### Remaining HIGH/CRITICAL findings requiring human review

These are reported by `npm audit` as having a "fix available" but the fix is
gated behind a **major/breaking version bump** of a direct dependency
(`isSemVerMajor: true`), or `npm audit fix` cannot resolve them without
`--force` even though it doesn't explicitly say so (deeply nested dev-only
transitive deps where the top-level parent needs a major bump). Per
instructions, these were **not** auto-applied:

| Package | Severity | Path | Notes |
|---|---|---|---|
| `tar` | **CRITICAL** | `@mapbox/node-pre-gyp` → `tar` (used by `bcrypt` native build) | Multiple advisories (arbitrary file overwrite/hardlink path traversal, DoS). Fix requires bumping `@mapbox/node-pre-gyp`, which is a build-time/dev dependency, not exposed at runtime, but should be upgraded. |
| `tmp` | HIGH | `@nestjs/cli` → `@angular-devkit/schematics-cli` → `inquirer` → `external-editor` → `tmp` | Symlink/path traversal in temp file writes. Dev-only (CLI tooling), not part of runtime server. |
| `@nestjs/platform-express` | HIGH | direct dependency, `12.0.1` available (currently on 10.x line) | Would bump NestJS platform-express to v12 — **major version, breaking change**, needs manual migration/testing against the rest of the NestJS 10.x stack. |
| `multer` | HIGH | via `@nestjs/platform-express` upgrade | Tied to the platform-express major bump above. |
| `@typescript-eslint/*` (eslint-plugin, parser, type-utils, typescript-estree, utils) | HIGH | dev dependency chain | Fixable but pulls a major ESLint tooling bump; dev-only, not runtime risk, but flagged for review. |
| `lodash` | HIGH | via `@nestjs/config` → `12.0.0` | Major bump of `@nestjs/config`. |
| `picomatch` | HIGH | via `@nestjs/schematics` → `12.0.0` | Major bump, dev-only CLI tooling. |
| `glob` | HIGH | dev dependency chain | Fixable without explicit major flag reported, but bundled with other changes above; left for a coordinated dependency bump pass. |
| `@nestjs/cli` | HIGH | direct devDependency | Tied to the NestJS v10→v12 CLI ecosystem bump. |

**Recommendation:** Schedule a coordinated NestJS 10 → 12 upgrade (platform-express,
config, schedule, schematics, cli, throttler, bull) in a dedicated PR with full
regression testing — several of these packages are interdependent and must be
bumped together. The `tar`/`tmp` issues are transitively pulled in via
`bcrypt`'s native build tooling and Angular DevKit CLI schematics; both are
build/dev-time only (not present in the running server), but should still be
tracked and resolved when the CLI toolchain is upgraded.

## Frontend (`frontend/`)

**Result:** 4 vulnerabilities (3 moderate, 1 high) — **no HIGH/CRITICAL fixable
without a breaking change**, so no automatic fix was applied.

| Package | Severity | Fix available | Notes |
|---|---|---|---|
| `vite` | HIGH | Requires `vite@8.2.2` (`isSemVerMajor: true`) | Current major line is far behind; a jump to vite 8 is a major/breaking build-tool upgrade needing manual verification (plugin compatibility, config changes). |
| `esbuild` | moderate | via vite major bump | Same as above. |
| `react-router` / `react-router-dom` | moderate | non-major fix available | Below HIGH/CRITICAL threshold for this pass; can be picked up in routine dependency maintenance. |

**Recommendation:** The single HIGH finding (`vite`) requires a major version
bump and was intentionally **not applied** per the no-`--force` policy. This
needs a dedicated PR to upgrade the Vite build pipeline and verify the entire
frontend build/dev server still works before merging.

## Actions taken in this PR

- `backend/`: ran `npm audit fix` (safe, non-breaking) — reduced backend
  vulnerability count from 36 to 29; verified `npm run build` (`nest build`)
  still succeeds.
- `frontend/`: ran `npm audit`; no safe (non-major) fix was available for the
  one HIGH finding, so **no code change was made** to `frontend/`.
- No `--force` fixes were applied anywhere.
- Full raw `npm audit --json` output captured before/after for reference
  (see PR discussion / attached logs).

## Follow-up work needed (human review)

1. Coordinated NestJS v10 → v12 dependency bump (backend) — resolves most
   remaining HIGH findings (`@nestjs/platform-express`, `multer`, `lodash`
   via `@nestjs/config`, `picomatch` via `@nestjs/schematics`, `@nestjs/cli`).
2. Vite major upgrade (frontend) — resolves the one remaining HIGH finding.
3. Upgrade `@mapbox/node-pre-gyp` (pulls in `tar`) and the Angular DevKit
   CLI schematics chain (pulls in `tmp`) — both dev/build-time only,
   lower urgency but still a CRITICAL/HIGH advisory match.
