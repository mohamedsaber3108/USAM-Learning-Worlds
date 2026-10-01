# 37 — FRONTEND ARCHITECTURE

> Where and how the ONE frontend is built. Target RESOLVED + LOCKED via the
> deployment chain (02 §A).

Date: 2026-09-30 (corrected after deployment-chain verification)

---

## 1. Rebuild target — LOCKED: `frontend/`

**Build inside `frontend/src/`** (React 18 + react-router-dom v6 + axios +
zustand + framer-motion + Vite 5 + i18next). Authoritative evidence:
- `scripts/deploy.sh` step 3 → `cd "$REPO/frontend"` → npm ci → `tsc --noEmit`
  → `npm run build` → verify `dist/index.html` → nginx reload → verify-deployment.
- `.github/workflows/ci.yml`: `frontend` job `working-directory: frontend` +
  `frontend-canonical-guard` job that FAILS the build if deploy ever targets root
  `src/` ("root src/ is the Lovable scaffold, intentionally NOT built/deployed").
- `docs/architecture/FRONTEND_CANONICAL.md` confirms.

Root `src/` (TanStack/Lovable, React 19) = LEGACY scaffold. NOT a build target
(CI-enforced). Keep marked (`src/LEGACY_DO_NOT_EDIT.md`); delete only via the
Lovable-safe salvage-then-remove process (77). **This is LOCKED — not revisited**
(owner-authorized verification done).

## 2. Stack (`frontend/`)

React 18, react-router-dom v6, Vite 5, axios, zustand, framer-motion, i18next
(EN/AR). Real API client `frontend/src/lib/api/endpoints.ts` (61 groups). Router
`frontend/src/app/router/index.tsx`. Tests vitest. 24 feature dirs present
(admin, analytics, auth, billing, characters, coding, community, cosmetics,
creativity, cross-curricular, dashboard, english, evidence, gamification,
landing, learning, missions, onboarding, parents, practice, projects, stories,
thinking-skills, voice). Coding runtime lazy-loaded (home-bundle perf gate).

## 3. Integration reality (`frontend/` is largely REAL)

`frontend/src/lib/api/endpoints.ts` is a real axios client (~61 groups) hitting
the backend. So the work here is NOT "swap mocks" — it is: VERIFY each group's
real response shape, FINISH partial wiring, and REBUILD surfaces that are
structurally wrong/missing (directive §5: let bad pages die; do not preserve).
The prior frontend-rebuild effort landed in this tree — reconcile its actual
state honestly in 45 (don't assume done).

> The root `src/services/contracts.ts` "mock→real seam" is the LEGACY tree's
> concern, not this path. Salvage valuable patterns/content from root `src/`
> (richer character authoring, Arabic pluralization) per 77, then delete it.

## 4. API base + prefix

Backend global prefix `/api` (verified main.ts). Frontend base `/api`
(same-origin prod) via `endpoints.ts` axios instance + token handling + refresh.

## 5. Design / visual system (research-driven, replaceable — 22, directive §4/§5)

The visual identity is NOT locked to any existing tree's styling. Build the final
USAM design language (palette/type/spacing/radii/shadows/cards/nav/iconography/
illustration/motion) from the research + child-UX + Arabic-first + characters +
worlds + age bands, expressed as SEMANTIC design tokens. Reuse the strong
age-presentation MODEL concept from root `src/design/age-presentation.ts` as
reference (3 modes), but the token VALUES and component styling are rebuilt in
`frontend/` to feel like USAM — not Duolingo/SaaS/Lovable-template.

## 6. Routing / shell

One role-variant shell (18). Routes reconciled to IA (17): learner, parent, mod,
admin, public. Honest 404 (auth+unauth), role guards with honest 403.

## 7. Rules

- ONE frontend (`frontend/`). Root `src/` + any preview deprecated/deleted (41).
- All strings i18n (EN/AR), RTL via logical properties.
- No parallel component system; one design-token system.
- Let structurally-bad pages die and rebuild (directive §5), not re-skin.
