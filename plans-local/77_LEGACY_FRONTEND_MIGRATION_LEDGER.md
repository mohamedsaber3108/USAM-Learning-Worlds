# 77 — Legacy Frontend Migration Ledger (salvage-before-delete)

> Compares the LEGACY root tree `src/` (`tanstack_start_ts`, Lovable scaffold,
> **not deployed**) against the CANONICAL `frontend/src/`
> (`usam-learning-worlds-frontend`, **deployed** by `scripts/deploy.sh` + CI).
> Purpose: identify every piece of UNIQUE, VALUABLE logic in the legacy tree so
> nothing is lost before the legacy tree is removed. Evidence-based (deep audit
> 2026, commit ~a4a64f1).

## Headline

The legacy tree's ONLY real backend integration is `src/services/api.ts` (raw
`fetch`), and it is a strict **subset** of canonical `frontend/src/lib/api/endpoints.ts`
(axios, ~50 groups). Every other legacy service is **mock/data-backed**
(`respond(mock.*)` over `src/data/*`). So no working backend wiring is lost by
deleting `src/`. The valuable-but-unique material is (a) a few UX/design
patterns and (b) authored static content + Arabic pluralization.

## ⚠️ Deletion constraint (Lovable)

`.lovable/project.json` → `"template": "tanstack_start_ts_current"`. The root
`src/` + root `package.json` + root `vite.config.ts` are the **Lovable-managed
scaffold**. Deleting them may break Lovable editor sync and the project's
Lovable history (see `AGENTS.md`). **Deletion is deferred pending explicit
owner confirmation of Lovable-sync impact.** Salvage (below) can proceed now;
physical removal is a separate, owner-approved, separately-committed step.

## Verdict legend
- **ALREADY-PORTED** — canonical has equal-or-better; delete-safe.
- **SAFE-TO-DELETE** — scaffold/duplicate/mock; no unique value.
- **NEEDS-PORT** — unique value; harvest before delete (code, content, or design ref).

## Ledger

| Area / file(s) | Purpose | Canonical equivalent | Verdict |
|---|---|---|---|
| `coding/PyodideRunner`, `CodeMissionRunner`, `SandpackMission` | Pyodide test-model runner | `frontend/src/features/coding/*` (superset: +Blockly, +i18n) | ALREADY-PORTED → SAFE-TO-DELETE |
| `coding/CodeEditorShell` | age-adaptive editor stub (mock run) | `CodeMissionRunner` | SAFE-TO-DELETE |
| `coding/MentorPanel` | 7-kind agency mentor ("Koda"): hint / debugging-question / explanation / guided-correction / example / concept-explanation / reflection; escalates after 3 asks | `CodingCoachPanel` ("Codey", 2 kinds: explain+debug via real `codingCoachApi`) | NEEDS-PORT (pedagogy/UX ref; backend exists only for explain/debug/challenge) |
| `coding/PathwayMap` (+ConceptDetail/AdapterBoard/LabCard) | 18-concept age-framed coding spine w/ mastery/prereqs/gating | `CodingPage` (flat list from real `crossCurricularApi` + `/learning/domains/coding/path`) | NEEDS-PORT (design ref only; legacy is mock-backed) |
| `coding/Workbench` | multi-panel browser IDE (files/blocks/console/preview/tests/debug/history) | none (canonical uses per-mission runner) | NEEDS-PORT (design ref only; mock evaluator) |
| `services/api.ts` | real fetch: characters/english-coach/coding-coach/coding-sandbox/translations/auth | `endpoints.ts` (superset) | ALREADY-PORTED (subset) |
| `services/index.ts` + 17 domain services | mock repositories over `data/*` | `endpoints.ts` + features | SAFE-TO-DELETE (mock) |
| `design/*` (`age-presentation.ts`, `tokens.ts`, `AgePresentationProvider`, `character.ts`) | 3-mode age design system (Explorer 8-9 / Creator 10-11 / Pathfinder 12-14), ~30 knobs: copyBudget, cardColumns, density, motionMultiplier, codingSurface, navComplexity… via CSS vars | Tailwind palette + `lib/theme/colors.ts` + `lib/hooks/useAgeAdaptation.ts` (AGE_8_9/10_11/12_14; no age-mode CSS-var contract) | NEEDS-PORT (product decision — richest unique subsystem; see task #14 age-model work) |
| `state/experience.ts` | age-adaptation context (`useExperience`) | zustand + react-query; `useAgeAdaptation` | SAFE-TO-DELETE (idea travels with design decision) |
| `hooks/*` (use-focus-trap, use-reduced-motion, use-responsive, use-mobile, use-keyboard, use-lazy-load, use-api-state, useAzouz) | generic a11y/responsive + companion | `frontend/src/lib/hooks/*` | SAFE-TO-DELETE (spot-check `use-focus-trap` + `use-reduced-motion` for a11y parity first) |
| `pages/*`, `routes/*`, `router.tsx`, `server.ts`, `start.ts`, `routeTree.gen.ts` | TanStack file-based router scaffold | `app/router/index.tsx` (react-router v6) + `features/*/pages` | SAFE-TO-DELETE (superseded; glance at `routes/design-system.tsx`, `venture.$labId`, `boss.$bossId` for unique UX ideas only) |
| `data/*` (18 files: careers, robotics, venture, studio, research, digital-citizenship, presentation, coding, curriculum, english, missions, characters, onboarding, mock, experience, home, ai-literacy, financial) | authored static content behind the mock services | backend seeds / `crossCurricular` categories / simulations / creativity | NEEDS-PORT (content review — harvest authored curriculum framings / mentor library text / concept spines before delete; code is disposable, prose may not be) |
| `locales/{en,ar}/*.json` | i18next namespaced strings | `lib/i18n/locales/{en,ar}.ts` (larger, superset of most keys) | NEEDS-PORT (targeted: legacy `ar/*` carries full Arabic CLDR plural forms `_zero/_one/_two/_few/_many/_other` that canonical `ar.ts` LACKS — harvest these) |

## Salvage checklist (before any deletion)

- [ ] Harvest Arabic CLDR plural forms from `src/locales/ar/*.json` into canonical `frontend/src/lib/i18n/locales/ar.ts` (concrete, verified-missing gap).
- [ ] Content review of `src/data/*` — decide which authored copy (careers/robotics/venture/research/digital-citizenship, coding concept spine, mentor library) is worth harvesting into backend seeds or canonical content.
- [ ] Product decision on the 3-mode age-presentation design system (`src/design/age-presentation.ts`) as input to the canonical age-model work (task #14). It uses the Bible-target bands 8-9/10-11/12-14 already.
- [ ] Design-reference capture of MentorPanel (7-kind pedagogy), PathwayMap, and Workbench UX for future coding-UX enhancement (backends are mock; not code-portable as-is).
- [ ] a11y spot-check: compare legacy `use-focus-trap` / `use-reduced-motion` against canonical `lib/hooks/*`.

## Deletion plan (owner-approved, separate commit)

1. Complete the salvage checklist above.
2. Confirm with the owner that removing the Lovable scaffold is acceptable
   (Lovable-sync / history impact).
3. Remove: `src/`, root `vite.config.ts`, and (if it exists solely for the dead
   app) root `package.json`/lockfile/`public/` — only after confirming they are
   not referenced by backend, `scripts/`, deployment, or docs tooling.
4. Commit separately: `chore(frontend): remove legacy Lovable scaffold (root src/)`.
