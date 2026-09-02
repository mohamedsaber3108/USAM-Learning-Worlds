# Frontend Architecture Decision — Dual Implementation Resolved

**Date:** 2026-09-02 | **Decided by:** autonomous security/build tick

## Finding

This repo contains two parallel frontend implementations:

1. **`frontend/`** — Vite + React + `react-router-dom` v6 + `zustand` for
   state, Tailwind. Package name `usam-learning-worlds-frontend`.
2. **`src/` (repo root)** — Vite + `@tanstack/react-start`/`@tanstack/react-router`
   + `@tanstack/react-query`. Package name `tanstack_start_ts`.

## Verification method (not guessed from filenames)

Pulled the actual bundle served in production
(`https://kids.usamif.com/assets/index-DfshxS8H.js`, ~386KB) and grepped it:

- Contains `persist(` (zustand signature) — present.
- Does **not** contain `createFileRoute`, `createRootRoute`, or any
  TanStack Router signature strings — absent.
- Contains route path literals `"/dashboard"`, `"/projects"`,
  `"/missions"` matching `frontend/src/features/{dashboard,projects,missions}`
  page names.
- The root `src/` tree's own `index.html` references `/src/main.tsx` as a
  module entry (Vite dev pattern) — not the built bundle actually served.

**Conclusion: `frontend/` is the live, deployed, authoritative frontend.**
Root `src/` (TanStack Start/Router) is a dead/parallel implementation not
reflected in production at all.

## Decision

- `frontend/` remains the one true frontend going forward. All new UI work
  happens there.
- Root `src/` is **deprecated**, not deleted yet (deletion is a bigger,
  more disruptive change than needed to close this security/hygiene pass —
  flagged as a follow-up decision, not blocking). It should not receive new
  feature work. If no one revives it within a reasonable window, remove it
  entirely along with its `package.json`/`tsconfig.json`/`vite.config.ts`/
  `bun.lock` at repo root to stop confusing future contributors and CI.
- `tsconfig.json` at repo root belongs to the deprecated `src/` tree —
  strictness was already fairly high there; `frontend/tsconfig.json` was
  brought up to matching strictness (`noImplicitOverride`,
  `noImplicitReturns`, `noPropertyAccessFromIndexSignature`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) on 2026-09-02,
  verified via `npx tsc --noEmit` passing clean after fixing one real
  type error surfaced in `MissionsBrowsePage.tsx`.

## Action items (tracked, not yet done)

- [ ] Decide firm deadline for removing root `src/` tree or reviving it as
      a genuine second product surface (e.g. admin panel). Ambiguous
      product call — flagged for human decision, not resolved unilaterally.
- [ ] Add CI/CD (planned per security fix item (j)) that builds **only**
      `frontend/` to prevent accidental deploys of the dead tree.
