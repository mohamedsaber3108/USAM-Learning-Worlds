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

## Frontend Rebuild (`frontend-rebuild/`) — 2026-10-02 pre-cutover audit

Full audit (`npm audit`, includes devDependencies): **7 vulnerabilities (5
moderate, 1 high, 1 critical)**.

Production-only audit (`npm audit --omit=dev` — what actually ships in the
built bundle served to users): **2 vulnerabilities (both moderate)**.

### Full-audit findings NOT present in the production bundle (dev-tooling only)

| Package | Severity | Advisory | Why it does not ship |
|---|---|---|---|
| `vitest` | **CRITICAL** (9.8) | [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) — arbitrary file read/execute via Vitest UI server | Test runner, devDependency only. Vitest UI server is never started in this project (no `vitest --ui` script) and is not part of the built `dist/` artifact. |
| `vite` | **HIGH** (7.5) | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) — `server.fs.deny` bypass on Windows | Dev server only (`vite dev`); the production artifact is static files produced by `vite build` and served by nginx, not the Vite dev server. Not reachable in production. |
| `@vitest/mocker`, `vite-node`, `esbuild`, `vite` (3 more moderate advisories) | moderate | path traversal / dev-server request forwarding | Same reasoning — all are transitive to `vite`/`vitest` dev tooling, never bundled into `dist/`. |

**Fix path exists for all of the above** (`vitest@5.0.3`, `vite@8.3.2`) but
both are major/breaking bumps (`isSemVerMajor: true`) to the build toolchain.
Per the no-blind-`--force` policy, and because none of these are reachable in
the shipped artifact, this is **deferred** to a dedicated toolchain-upgrade PR
rather than rushed before cutover.

### Production-relevant findings (ship in the actual bundle)

| Package | Severity | Advisory | Reachability analysis | Decision |
|---|---|---|---|---|
| `react-router` (transitive) / `react-router-dom` (direct, `^6.26.2`) | moderate | [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) — open redirect via backslash in `<Link>`/`useNavigate` | Requires an attacker-controlled path string (containing a backslash) to reach `<Link to={...}>` or `navigate(...)`. Audited every `navigate(...)` call and every dynamic `to={...}` in `frontend-rebuild/src/**`: all targets are either string literals (`'/app'`, `'/login'`, etc.) or template literals built from backend-issued ids/slugs (`/app/missions/${missionId}`, `/app/companions/${c.id}`, `/verify/${c.uid}`) — never raw, attacker-suppliable free text (no `searchParams.get('redirect'/'next'/'returnTo')` pattern exists anywhere in the app; confirmed via grep). **Not reachable with the current codebase's routing usage.** | JUSTIFIED — not exploitable as the app is written; re-audit if any future code ever builds a `to=`/`navigate()` target from unsanitized user/query input. |
| `react-router` / `react-router-dom` | moderate | [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg) — arbitrary constructor injection via `deserializeErrors()` in SSR hydration | Requires the React Router **data router** (`createBrowserRouter`/`RouterProvider`) with SSR hydration (`hydrateRoot`) and `useLoaderData`/`useActionData`. Confirmed via grep across `frontend-rebuild/src/**`: the app uses plain `<BrowserRouter>` + `<Routes>/<Route>` (declarative mode, `src/app/App.tsx`), client-only rendering via `createRoot` (`src/main.tsx`, not `hydrateRoot`), and zero occurrences of `createBrowserRouter`, `RouterProvider`, `useLoaderData`, `useActionData`, or `deserializeErrors` anywhere in the tree. **Not reachable — the vulnerable code path (SSR hydration + data router) does not exist in this app's architecture.** | JUSTIFIED — not exploitable; this app has no SSR and no data router. |

No non-breaking fix exists for either: the latest `6.x` releases of both
packages (`react-router@6.30.6` / `react-router-dom@6.30.6` — already
installed, confirmed via `npm ls`) are the newest in that major line: npm's
own `fixAvailable` only points at `react-router-dom@7.18.4`
(`isSemVerMajor: true`). A v6→v7 upgrade is a real migration (API surface
changes) and is correctly treated as **deferred, non-blocking** follow-up
work rather than rushed into the cutover window — tracked for a dedicated PR
after production is stable.

**Net result for the P0/P1 production-readiness gate** ("a production-relevant
CRITICAL/HIGH vulnerability must be resolved or explicitly justified before
cutover"): **zero CRITICAL/HIGH findings ship in the production bundle.** The
only prod-relevant findings are 2 MODERATE react-router advisories, both
justified above as not reachable given this app's actual routing usage and
architecture (no SSR, no data router, no unsanitized redirect targets).

---

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
