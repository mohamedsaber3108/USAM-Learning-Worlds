# STATUS — Reconstruction Program Tracker

> Live status per mandate §6. Updated every slice. Seeded from work already
> shipped and verified against `https://kids.usamif.com`.

Branch `fix/p0-p1-remediation` · HEAD `46c0cc1` · Live bundle `index-D1OMWY6o.js`

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
| **G-3 living-world Home: World Journey strip** | pending | no | 🟡 built+verified, commit pending |

## In progress

| Item | State |
| --- | --- |
| Deploy + live-verify G-3 | 🟡 |
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
