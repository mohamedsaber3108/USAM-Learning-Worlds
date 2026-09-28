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
| 7a | Seed FREE/EXPLORER/FAMILY/SCHOOL plans (TRIALING already in enum) | G-4 | **yes** | ✅ DONE (migration 20260924) |
| 7b | Wire gates: missionsPerDay (missions), voice (voice/turn), aiTutor (character chat) | G-4 | **yes** | ✅ DONE |
| 7c | `/plans` + upgrade UI reading real plans (entitlementsApi) | G-4 | no | ✅ DONE |
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

---

## Frontend Reconstruction Program (Reference Bible §39) — added 2026-09-23

Derived from `docs/frontend/FRONTEND_REBUILD_ARCHITECTURE.md`. Strategy is
**incremental shell-first route replacement** (not big-bang delete) so the
Lovable-connected branch stays deployable and no backend engine is orphaned
(Bible §35/§37). Legacy pages are deleted per-phase only after their replacement
is live + verified.

| Phase | Scope | State |
| --- | --- | --- |
| A. Research + architecture (§38 docs) | reference bible, OSS matrix, product bible, competitor + learning-science research, page/flow inventory, design system, rebuild architecture, voice + english registries | ✅ this batch |
| B. Design-system layer | Radix-backed `ui/*` + owned `system/*` components (+ Storybook POC) | 📋 next |
| C. Shell + Home | age-adaptive AppShell/nav + world-map Home | 📋 |
| D. World/mission spine | world map + world detail (+ mission player already rebuilt) | 📋 |
| E. Domain surfaces | English, Coding (+CodeMirror where needed), AI-learning (NEW), practice, creativity/thinking, stories, simulations | 📋 |
| F. Projects/portfolio/progress | project workspace (NEW), progress/mastery rework, achievements | 📋 |
| G. Parent area | dashboard, linking, weekly reports (NEW), consent (keep), billing | 📋 |
| H. QA gate | Playwright E2E, responsive, a11y, Lighthouse, visual | 📋 |
| I. Production gate | Bible §37 checklist; reconcile repo ↔ deploy | 📋 |

External blockers (stop only for these): Bedrock creds (AI/voice/coach runtime),
payment processor + keys (G-4 7d), legal jurisdiction review, irreversible product
decisions (drop-a-domain / final pricing).
