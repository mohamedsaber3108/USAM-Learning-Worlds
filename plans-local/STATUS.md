# STATUS — Reconstruction Program Tracker

> Live status per mandate §6. Updated every slice. Seeded from work already
> shipped and verified against `https://kids.usamif.com`.

Branch `fix/p0-p1-remediation` · HEAD `dfc294c` · Live bundle `index-THaV01Iq.js` (verified live 2026-09-23)

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
| **/plans discoverable via More menu (nav)** | pending | no | 🟡 built+verified, commit pending |
| G-4 7d: real payment gateway behind provider interface | 📋 |
| G-2c render smoke tests (onboarding/recommendations) | 📋 |

## Blocked

| Item | Reason |
| --- | --- |
| AI tutor / voice realtime verification | ⛔ Bedrock creds not available to agent; user-side only |

## Next (from gap register)

1. 📋 E2E tests for the critical journeys (G-2).
2. 📋 Deeper "living world" Home visual (G-3).
3. 📋 Portfolio/evidence child surface (G-5).
4. 📋 Packaging/pricing product model spec first (G-4, Phase 3) → then entitlement UI.
