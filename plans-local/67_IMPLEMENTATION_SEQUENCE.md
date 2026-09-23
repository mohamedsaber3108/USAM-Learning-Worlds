# 67 — Implementation Sequence

> The order in which gaps (`63_PRODUCT_GAP_ANALYSIS.md`) become shipped,
> verified, deployed slices. Sequenced by child-journey impact and by
> dependency (specs before UI where the mandate requires it).

Last updated: 2026-09-22 · HEAD `48b3bde`

---

## Sequencing principle

1. **Unblock the core child loop first** (P0), because a child alone must be
   able to complete Story → Learn → Practice → Reward end to end.
2. **Lock in with tests** so shipped journeys don't regress.
3. **Then coherence/value** (living world, portfolio) and the
   **spec-first business model** (no pricing UI before the packaging model).
4. **Then depth** (curriculum content, a11y, orphan sweep).

Every step is a self-contained slice: implement → verify (tsc/build/lint/test)
→ deploy → live-verify → update `STATUS.md`.

---

## Ordered backlog

| # | Slice | Gap | Backend? | Gate before start |
| --- | --- | --- | --- | --- |
| 1 | Mission **Learn** teaching step (FE) | G-1 | no | none — NEXT |
| 2 | E2E: register→onboarding→mission→reward + login + RTL | G-2 | no | after #1 |
| 3 | E2E: recommendations / worlds / simulations / consent | G-2 | no | after #2 |
| 4 | Living-world Home depth | G-3 | maybe | after #2 |
| 5 | Portfolio/evidence child surface | G-5 | maybe | after #3 |
| 6 | **Spec** 47_PRICING_PACKAGING + 48_BUSINESS_MODEL | G-4 | — | ✅ DONE |
| 7a | Seed FREE/EXPLORER/FAMILY/SCHOOL plans + add TRIALING status | G-4 | **yes** | after #6 spec ✅ → NEXT |
| 7b | Wire real gates (missionsPerDay/voice/aiTutor/maxLearners) via hasFeature/getLimit | G-4 | **yes** | after 7a |
| 7c | `/plans` + upgrade UI (never before 7a+7b) | G-4 | no | after 7b |
| 7d | Real payment gateway behind provider interface | G-4 | **yes** | after 7c |
| 8 | Orphan-engine sweep + doc | G-8 | no | rolling |
| 9 | Accessibility audit pass | G-7 | no | rolling |
| 10 | Curriculum content per age band | G-6 | content | ongoing |

## Definition of done per slice

- `npx tsc --noEmit` = 0
- `npm run build` = 0
- `npx eslint <changed>` = 0
- relevant tests pass (add tests for new journeys)
- committed + pushed to `fix/p0-p1-remediation`
- deployed; `scripts/verify-deployment.sh` all-green live
- `STATUS.md` updated; backend slices note the required `pm2 restart`

## Blocked, parked until unblocked

- AI tutor / voice realtime (G-B1) — needs Bedrock creds on server.
