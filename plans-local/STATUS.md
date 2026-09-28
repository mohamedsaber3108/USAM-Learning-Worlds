# STATUS — Reconstruction Program Tracker

> Live status per mandate §6. Updated every slice. Seeded from work already
> shipped and verified against `https://kids.usamif.com`.

Branch `fix/p0-p1-remediation` · HEAD `8a84f03` · Last live-verified bundle `index-B5sC8ROB.js` (2026-09-23)
> Note: commits after `8e00d09` (G-7 `61678d4`, G-9 `8a84f03`) are pushed but await a frontend redeploy to go live.

> Deploy note: raw-SQL migrations must be run with the connection string from
> `backend/.env` — `$DATABASE_URL` is NOT exported in the shell, so bare `psql
> "$DATABASE_URL"` connects as OS user `ubuntu` and fails ("role ubuntu does
> not exist"). Use:
> `DB_URL="$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | tr -d '\"')" && psql "$DB_URL" -f <migration>`

Legend: ✅ done+verified live · 🟡 in progress · ⛔ blocked · 📋 planned

---

## Foundational program docs

| Doc | State |
| --- | --- |
| 00_MASTER_RECONSTRUCTION_PLAN.md | ✅ written |
| 01_PRODUCT_NORTH_STAR.md | ✅ written |
| 63_PRODUCT_GAP_ANALYSIS.md | 🟡 this batch |
| 67_IMPLEMENTATION_SEQUENCE.md | 🟡 this batch |
| Remaining numbered specs (02–62, 64–66, 99) | 📋 authored on-demand as their phase is executed (mandate §5: no empty docs) |

---

## Shipped + verified live (Approach C slices)

| Slice | Commit | Backend? | State |
| --- | --- | --- | --- |
| Design system (warm canvas, tactile, Nunito, teal) | — | no | ✅ |
| Landing page ground-up rebuild | 5c3ea08 | no | ✅ |
| Floating pill nav; bell/search contrast fix | — | no | ✅ |
| Home adaptive recommendations section | — | no | ✅ |
| Credentials / Open Badges on Achievements | — | no | ✅ |
| Worlds map `/worlds` | — | no | ✅ |
| Simulations browse + player | — | no | ✅ |
| Privacy/Consent (COPPA/GDPR) parent page | — | no | ✅ |
| Balanced Development `/balanced` | 843878e | no | ✅ |
| Onboarding Interests step + `PATCH /auth/me/preferences` | 2532c78 | **yes** | ✅ |
| Home interest chips | c2c4d3e | no | ✅ |
| Recommendation engine interest-weighting | 979a0f7 | **yes** | ✅ |
| Home companion character (Azouz) | a19a09c | no | ✅ |
| Deployment verification script | 47c71f8 | no | ✅ |
| **Mission reward loop fix + player/complete i18n** | 48b3bde | no | ✅ |
| plans-local master reconstruction program | f9aa4c8 | no | ✅ |
| **Mission Learn teaching step (G-1) + unit tests** | 46c0cc1 | no | ✅ live (bundle index-CM4B5Wy5.js, verified 2026-09-23) |

| **G-2 integration tests: reward loop + Learn step** | 7b7fd7e | no | ✅ pushed (14 tests) |
| **G-2b integration tests: login + language/RTL** | 783bf6b | no | ✅ pushed (20 tests) |
| **G-3 living-world Home: World Journey strip** | 7c7c2ee | no | ✅ live |
| **G-5 evidence portfolio (mastery+credentials+projects)** | 2b9e92e | no | ✅ live |

| **G-4 packaging/pricing spec (47 + 48)** | 5c4a8fe | no | ✅ pushed |
| **G-4 7a+7b: seed 4 plans + 3 gates (missions/voice/aiTutor)** | 04c4aa9/6353e03 | **YES** | ✅ live — 4 plans seeded, FREE aiTutor=false verified |

| **G-4 7c: /plans page + upgrade flow (frontend)** | dfc294c | no | ✅ live (/plans 200) |

## In progress

| Item | State |
| --- | --- |
| **/plans discoverable via More menu (nav)** | 8e00d09 | no | ✅ live |
| **G-8 orphan-engine sweep (66_FINAL_ENGINE_INVENTORY)** | 4f42efb | no | ✅ |
| **G-7 accessibility: skip link + axe gate (3 tests)** | 61678d4 | no | ✅ |
| **G-9 Ask-the-Coach panel (coding-coach engine surfaced)** | 8a84f03 | no | ✅ built (⛔ AI runtime unverified — Bedrock) |
| **docs/platform-audit index (recovery-mandate reconciliation)** | aa2cd67 | no | ✅ |
| **Frontend Reconstruction Phase A: §38 research+architecture docs** | pending | no | 🟡 this batch (10 Bible artifacts) |

## Frontend Reconstruction Program (Reference Bible §39)
Strategy: incremental shell-first route replacement (see `docs/frontend/FRONTEND_REBUILD_ARCHITECTURE.md`), deployable each phase, zero engine loss.
| Phase | State |
| --- | --- |
| A research + architecture (§38 docs) | ✅ cf4399a |
| **B design-system layer (Radix + owned components)** | ✅ 2d570cb — primitives built+tested (Dialog/Menu/Tabs/Tooltip/Popover/Toast/Progress/Field), axe-clean |
| **C app shell: age-adaptive navigation + distinct parent shell** | 🟡 this batch — navModel (young/mid/older/parent) drives desktop+mobile nav; legacy hardcoded primaryNav/moreItems DELETED; 34 tests |
| D world-map Home · E domain surfaces · F projects/portfolio/progress · G parent · H QA gate · I production gate | 📋 |

## In progress

| Item | State |
| --- | --- |
| G-4 7d: real payment gateway behind provider interface | 📋 ⛔ needs processor + keys |
| G-2c render smoke tests (onboarding/recommendations) | 📋 |
| G-6 per-age-band curriculum content scaffolding | 📋 |

## Blocked

| Item | Reason |
| --- | --- |
| AI tutor / voice realtime verification | ⛔ Bedrock creds not available to agent; user-side only |

## Next (from gap register)

1. 📋 E2E tests for the critical journeys (G-2).
2. 📋 Deeper "living world" Home visual (G-3).
3. 📋 Portfolio/evidence child surface (G-5).
4. 📋 Packaging/pricing product model spec first (G-4, Phase 3) → then entitlement UI.
