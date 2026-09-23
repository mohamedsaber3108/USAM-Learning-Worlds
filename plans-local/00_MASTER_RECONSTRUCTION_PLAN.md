# 00 — Master Reconstruction Plan

> Source of truth for the USAM Kids reconstruction program. This document
> reconciles the "destroy and rebuild from zero" mandate with the **verified
> reality** of the codebase and live deployment, and defines the executable
> path from where we are to the final market-ready product.

Last updated: 2026-09-22 · Branch `fix/p0-p1-remediation` · HEAD `48b3bde`

---

## 1. Verified ground truth (measured, not assumed)

These are facts confirmed this session by direct inspection and live probes,
not memory:

| Fact | Evidence |
| --- | --- |
| Frontend is deployed and live | `curl https://kids.usamif.com/` serves a real hashed bundle (`index-D1OMWY6o.js`) |
| Backend is live and healthy | `GET https://kids.usamif.com/api/health` → `200` |
| Deploy pipeline is correct | `scripts/verify-deployment.sh` returns all-green; live bundle hash == built bundle hash |
| Backend surface is large | **42 modules**, **58 controllers** under `backend/src` |
| Frontend surface is large | **64 `*Page.tsx`**, **21 feature areas** under `frontend/src` |

Backend modules (42): adaptive, ai, analytics, assessment-quality, audit,
auth, coding-sandbox, community, content-items, content-provenance,
content-qa, creativity, cross-curricular, curriculum-mapping, daily-goals,
difficulty-calibration, english-learning, entitlements, experimentation,
feature-flags, flashcards, gamification, interventions, learner-model,
learning, legal, mastery, media, misconceptions, missions, notifications,
parents, problem-solving, projects, questions, reflection, search,
simulation, visual-language, voice, worlds.

Frontend feature areas (21): admin, analytics, auth, characters, coding,
community, cosmetics, creativity, cross-curricular, dashboard, english,
gamification, landing, learning, missions, onboarding, parents, projects,
stories, thinking-skills, voice.

**Conclusion:** This is not an empty shell or a fake demo. It is a substantial,
deployed platform whose *implementation is real* but whose *product coherence
and scope* do not yet fully match the target vision.

---

## 2. The core decision: rebuild the WRONG parts, not everything

The mandate authorizes total destruction **but explicitly forbids destroying
required product capability** (mandate §2) and forbids building from scratch
without justification (§22). Applying the mandate's own rules to the verified
state above yields the operating decision:

> **Approach C — Forensic-audit each area against the target product, then
> rebuild the parts that are wrong as verified, independently-deployable
> slices, surfacing every orphan backend engine into real child-facing UX.**

### Why not literal from-zero rebuild

A `rm -rf frontend backend && rebuild` would:

1. **Destroy 42 real backend engines and 64 real pages** — a direct violation
   of mandate §2 ("DO NOT DELETE REQUIRED PRODUCT CAPABILITY") and §30
   ("No orphan concepts").
2. **Break the Lovable-connected branch** for the duration of the rewrite,
   violating the working-branch constraint (AGENTS.md) and the "market-ready"
   objective (§0). A half-migrated from-zero rewrite is the *least* deployable
   state possible.
3. **Not be completable or verifiable in a bounded effort.** A 52-engine /
   60-plan platform cannot be rebuilt from zero and reach the §41 production
   gate in one pass. Claiming otherwise would be dishonest.

### What Approach C preserves from the mandate

- **Destroy bad implementation** (§1) — yes, per-slice, with justification.
- **Zero capability loss** (§2) — every removal maps requirement → new solution.
- **OSS-first, no unjustified custom builds** (§21, §22).
- **Continuous verification, never stop halfway** (§31, §32) — every slice is
  tsc + build + lint + deploy + live-verify green before the next.
- **Product/child/parent truth audits** (§33–§35) drive slice priority.

---

## 3. The traceability rule (mandate §2, §37)

No feature disappears silently. Every deletion or replacement is recorded as:

```
CURRENT IMPLEMENTATION
  → UNDERLYING REQUIREMENT
  → PRODUCT PURPOSE
  → LEARNING PURPOSE
  → NEW SOLUTION → NEW ARCHITECTURE → NEW UI → NEW API → NEW ENGINE
  → TEST
```

Tracked in `63_PRODUCT_GAP_ANALYSIS.md` and `STATUS.md`.

---

## 4. Phase map (mandate §31) mapped to reality

| Phase | Mandate scope | State |
| --- | --- | --- |
| 0 Forensic audit | Full codebase + live inventory | **Done** — see §1, and `docs/reconstruction/00_MASTER_AUDIT.md` |
| 1 Product reconstruction | North star, requirements, journeys | **In progress** — `01_PRODUCT_NORTH_STAR.md` |
| 2 Learning/curriculum | Domains→skills→objectives→mastery | Partially real (mastery/adaptive engines live); needs curriculum spec |
| 3 Business/packaging/pricing | Plans, entitlements, pricing | **Gap** — `entitlements` module exists, no pricing model/UI |
| 4 UX / information architecture | Nav, IA | Nav rebuilt (pill nav); IA needs consolidation |
| 5 Design system | Tokens, components | **Done + live** (warm canvas, tactile, Nunito, teal) |
| 6 Frontend architecture | Pages, routing | Real (64 pages); coherence work ongoing |
| 7 Backend/domain | Services, engines | Real (42 modules); orphan-surfacing ongoing |
| 8 Core engines | 52-engine list | Most exist; audit for orphans in gap register |
| 9 Content architecture | Content model, provenance | `content-*` modules exist; content volume is the gap |
| 10 Child experience | Self-directed journey | Ongoing (onboarding, home, recommendations shipped) |
| 11 Learning domains | English/coding/AI/etc. | Engines exist; child-facing depth varies |
| 12 AI/voice/characters | Realtime, TTS/STT | **Blocked on Bedrock creds** (agent cannot verify) |
| 13 Projects/portfolio/evidence | PBL, credentials | `projects`, `credentials` live; portfolio UX partial |
| 14 Parent | Dashboard, privacy | Privacy/consent shipped; dashboard exists |
| 15 Safety/security | COPPA/GDPR, moderation | Legal/consent shipped; moderation partial |
| 16 Billing/entitlements | Plan → access | Module exists; needs product model first |
| 17 Analytics/observability | Events, dashboards | `analytics` module exists |
| 18 Testing/evaluation | E2E critical journeys | **Gap** — 1 test file today |
| 19 Performance/accessibility | Budgets, WCAG | Accessibility guide exists; needs audit pass |
| 20 Final visual/product QA | Coherence | Ongoing per slice |
| 21 Production gate | §41 checklist | Not yet — tracked in `99_FINAL_PRODUCTION_GATE.md` |

---

## 5. Execution protocol (mandate §6, §32)

For every slice:

```
PLAN (gap register entry)
  → IMPLEMENT (real UX + real API, no fake data)
  → VERIFY (tsc --noEmit · npm run build · eslint · vitest where relevant)
  → DEPLOY (git push → server pull/build → verify-deployment.sh live-green)
  → UPDATE STATUS.md
  → NEXT
```

Backend-touching slices additionally require `pm2 restart usam-backend
--update-env`. Frontend-only slices need only nginx reload + cache-cleaned
rebuild.

---

## 6. What "done" means (mandate §41)

Production readiness is declared only when `99_FINAL_PRODUCTION_GATE.md`'s
checklist is fully green with live evidence for each item. Until then, every
session ends with the branch deployable and the live site verified.
