# USAM Kids — Frontend Rebuild Architecture & Execution Contract

> Reference Bible §33/§34/§35/§36/§39. How the frontend is rebuilt from the
> product model (`docs/product/USAM_KIDS_PRODUCT_BIBLE.md`), page inventory
> (`PAGE_AND_FLOW_INVENTORY.md`), and design system (`USAM_DESIGN_SYSTEM.md`) —
> **without breaking deployability or losing any feature/engine.**

Date: 2026-09-23 · HEAD `aa2cd67`

---

## 1. Rebuild strategy: incremental shell-first, not big-bang delete
**Honest engineering position.** A literal `rm -rf frontend` on a 64-page, 42-engine,
bilingual-RTL, Lovable-connected, live product would (a) orphan every backend engine,
(b) break the deployed branch for the length of the rebuild, and (c) violate Bible
§35 ("do not delete the underlying product requirement") and §37 ("repository and
deployment state reconciled"). The Bible authorizes deletion "when that is the
strongest solution" — here the strongest solution that satisfies its own zero-loss
and production-gate rules is a **route-by-route replacement** behind a new shell:

1. Build the **new design-system component layer** (Radix + owned components) alongside the current one.
2. Build the **new age-adaptive AppShell + nav** and the **world-map Home** as the first replaced surfaces.
3. Replace surfaces **in dependency order** (shell → home → world/mission spine → domain surfaces → parent → polish), each PR keeping the app green and deployable.
4. **Delete** each legacy page only once its replacement is live and verified (map in `PAGE_AND_FLOW_INVENTORY.md`).

This gives the "rebuilt from the product, not the old pages" outcome the mandate wants, while never shipping a broken branch.

## 2. Component architecture
- `components/ui/*` — owned primitives (Radix-backed): Button, Dialog, Menu, Tabs, Tooltip, Popover, Toast, Tabs, Field.
- `components/system/*` — USAM composites: Card, IconChip, ProgressRing, CharacterState, Skeleton, CelebrationOverlay.
- `features/<domain>/components/*` — feature UI (mission player, world map, coach panel…).
- `components/layout/AppShell` — **age-adaptive** shell (nav varies by band).
- Strict rule: feature code imports from `ui`/`system`, never re-implements primitives (no duplication, Bible §35).

## 3. Data / state strategy
- Server state: TanStack Query per engine (`*Api` in `lib/api/endpoints.ts`), with loading/empty/error/offline handled at the query boundary via `CharacterState`.
- Local UI state: Zustand for cross-component ephemeral (nav drawer, onboarding step); component state otherwise.
- Auth: JWT in localStorage + axios interceptor (kept). Route guard + age-band redirect (kept).

## 4. Engine connection truth table (must be real in code + UI — Bible §36)
Each must be verifiable end-to-end after its surface is rebuilt:
- Core: `Learner Profile → Skill State → Adaptive → Recommendation → Mission/Practice → Assessment/Evidence → Mastery → Review → Recommendation`.
- Character: `Context → Activity → Orchestrator → AI/Voice → Safety → Feedback → State`.
- English: `Curriculum → Content → Practice → Voice → Assessment → Mastery → Review → Project → Portfolio`.
- Coding: `Curriculum → Mission → Sandbox → Coach → Assessment → Project → Mastery → Portfolio`.
- Parent: `Learner → Evidence → Report → Safety/Privacy → Controls`.
- Commercial: `Package → Plan → Subscription → Entitlement → Access`.

## 5. Phase plan (tracked in `plans-local/STATUS.md` + `67_IMPLEMENTATION_SEQUENCE.md`)
| Phase | Scope | Deployable at end? |
| --- | --- | --- |
| **A. Research + architecture (this batch)** | §38 docs: reference bible, OSS matrix, product bible, competitor/learning research, page inventory, design system, this doc | yes (docs only) |
| **B. Design-system layer** | Radix-backed `ui/*` + `system/*` owned components + Storybook (POC) | yes (additive) |
| **C. Shell + Home** | Age-adaptive AppShell/nav + world-map Home | yes (replaces 2 surfaces) |
| **D. World/mission spine** | World map + World detail + mission entry (player already rebuilt) | yes |
| **E. Domain surfaces** | English, Coding (+CodeMirror where needed), AI-learning (NEW), practice, creativity/thinking, stories, simulations | yes, route-by-route |
| **F. Projects + portfolio + progress** | Project workspace (NEW), progress/mastery rework, achievements | yes |
| **G. Parent area** | Dashboard, linking, reports (NEW), consent (keep), billing | yes |
| **H. QA gate** | Playwright E2E (critical flows), responsive QA, a11y QA, Lighthouse, visual QA | yes |
| **I. Production gate** | Bible §37 checklist; reconcile repo ↔ deploy | ship |
Legacy pages deleted per-phase only after their replacement is live+verified.

## 6. Definition of Done per surface (Bible §37, no fake completion)
code exists · builds · runs · feature works · frontend↔backend↔engine connected ·
no mock in the production path · age adaptation real · states covered · a11y pass ·
tests pass (unit + relevant E2E) · no duplicate/dead code · docs+STATUS updated ·
deployed + `verify-deployment.sh` green.

## 7. External blockers (stop only for these — Bible §39)
- **AI/voice/coach runtime** → AWS Bedrock credentials (agent cannot verify).
- **Real payment gateway** → owner processor choice + keys.
- **Legal jurisdiction matrix** → lawyer review.
- **Irreversible product decisions** (e.g. dropping a domain, final pricing) → owner sign-off.
Everything else is codeable and proceeds without asking.

## 8. Migration/deletion map
See `PAGE_AND_FLOW_INVENTORY.md` §"Migration / deletion map" — every current route
maps to KEEP/REWORK/NEW/retire, cross-checked against `plans-local/66_FINAL_ENGINE_INVENTORY.md`
so no engine is orphaned.
