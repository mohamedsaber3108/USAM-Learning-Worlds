# 18 — Final Gap Analysis (Authoritative)

**Baseline:** `origin/main @ 3a787c0`, verified directly against the `M:\USAM-main` worktree. Statuses here supersede the provisional statuses in earlier files where corrections were issued (see the ⚠️ CORRECTION notices in 04/06/09).

> **Audit-integrity note:** several domain sub-agents read the workspace-indexed OLD copy (`m:\USAM Learning Worlds\backend`, unrelated history) rather than current `origin/main`. Every "still real" item below was re-verified against the real worktree. Items proven fixed on `origin/main` are listed under "Resolved on baseline" so they are not re-worked.

## A. CONFIRMED gaps on current `origin/main` (must fix)

### Security / Safety (highest stakes)
- **GAP-S1 (P0, CRITICAL):** Public `register` accepts and persists any `Role` incl. ADMIN/MODERATOR. `register.dto.ts` + `auth.service.register`. → USAM-IDN-007/008, SEC-001.
- **GAP-S2 (P0):** Mission-run IDOR — `getMissionRun(runId)` has no learner-ownership check. → USAM-MIS-001, SEC-001.
- **GAP-S3 (P0):** AI coach paths (`english-coach`, `coding-coach`, legacy `ai.controller`) enforce **no moderation/PII** — unprotected child-facing AI. → USAM-SAFE-006. *(Re-verify exact call sites on baseline; the safety services exist and the character path is protected.)*
- **GAP-S4 (P1):** No AI tool/capability permission system. → USAM-SEC-003.
- **GAP-S5 (P1):** Code sandbox isolation unverified (resource/network/FS limits). → USAM-CODE-005.
- **GAP-S6 (P1):** Refresh-token design guarded by access-token strategy; confirm/redesign. → USAM-IDN-003.
- **GAP-S7 (P1):** Red-team adversarial cases skipped in CI (no live-LLM eval env). → USAM-SAFE-005.
- **GAP-S8 (P1, legal):** No jurisdiction matrix / structured consent / platform-wide retention. → USAM-PRIV-001/002 (needs counsel).

### Data model
- **GAP-D1 (P1):** `XPGain.learnerId` FK mis-targets `Progression.id` (misnamed). → USAM-DB-002, GAM-001.
- **GAP-D2 (P1):** `PracticeStreak`/`StreakFreezePurchase` `learnerId` have no relation (no referential integrity). → USAM-DB-002.
- **GAP-D3 (P1):** Manual-psql migrations, no `prisma migrate`/lock; documented recurring drift. → USAM-DB-002, INFRA-006.
- **GAP-D4 (P2, design):** ~11 domain-concept tables fragment the knowledge graph. → USAM-KG-001 (decision).
- **GAP-D5 (P1):** No billing/entitlement models at all. → USAM-BILL-001.
- **GAP-D6 (P2):** No `ContentSource`/`ContentLicense` registry (provenance is free-text). → USAM-CMS-001/003.

### AI / RAG
- **GAP-AI1 (P1):** Model router is dead code — all traffic uses one model. → USAM-AI-002 (wire or remove).
- **GAP-AI2 (P1):** Cost/latency not tracked on the main Phase-3 path. → USAM-AI-003.
- **GAP-AI3 (P1):** RAG is Postgres full-text, not vector; citations prompt-level only. → USAM-RAG-001/002.
- **GAP-AI4 (P2):** Single provider registered; fallback unreachable. → USAM-AI-001.

### Learning depth (educational)
- **GAP-L1 (P1):** Spaced review is a naive fixed-bucket scheduler, not FSRS. → USAM-REV-002.
- **GAP-L2 (P1):** Character Orchestrator missing (no context-driven handoff). → USAM-CHAR-003.
- **GAP-L3 (P1):** Evidence→Portfolio→Credential chain incomplete (no Open Badges). → USAM-PORT-002, EVID-001.
- **GAP-L4 (P1):** English Listening/Speaking/Writing lack real interactive backends; pronunciation scoring faked; translation content is placeholder. → USAM-ENG-004/005/006/007, LOC-003.
- **GAP-L5 (P1):** `completeMission` computes no outcome/score/XP; mission→required-activity completeness unchecked. → USAM-MIS-001, BE-M3.
- **GAP-L6 (P2):** Visual coding (Blockly/Scratch) missing. → USAM-CODE-002.
- **GAP-L7 (P2):** "Does it actually teach?" validation not done per experience. → USAM-TRUTH-001 (research).

### Frontend / platform / quality
- **GAP-F1 (P1):** Zero frontend tests; only 4 backend specs. → USAM-TEST-001.
- **GAP-F2 (P1):** Dashboard ignores existing skeleton/error primitives; no ErrorBoundary anywhere. → USAM-FE-002.
- **GAP-F3 (P2):** Zustand unused; auth state raw localStorage, non-reactive; stale `User.userType` type. → USAM-FE-003.
- **GAP-F4 (P2):** i18n string externalization incomplete across many pages. → USAM-LOC-002.
- **GAP-F5 (P2):** A11y: no dialog focus-trap; incomplete `prefers-reduced-motion`; no a11y CI. → USAM-A11Y-001/003.
- **GAP-F6 (P2):** Two frontends — root `src/` mock app still present; enforce single deploy + plan removal. → USAM-FE-002.
- **GAP-F7 (P2):** Error handling: raw `throw new Error` in controllers → HTTP 500 not 403. → USAM-BE-001.

### Missing whole subsystems
- **GAP-M1 (P1):** Billing/Entitlement (models+service+parent-only flow). → USAM-BILL-001/002.
- **GAP-M2 (P2):** Offline/PWA/low-bandwidth. → USAM-INFRA-002.
- **GAP-M3 (P2):** School/B2B readiness (org/teacher/class/LTI/OneRoster). → USAM-SCHOOL-001.
- **GAP-M4 (P2):** DR/business continuity, capacity planning, CDN/media pipeline. → USAM-INFRA-003/004/005.
- **GAP-M5 (P1):** Voice full pipeline (VAD/streaming/interruption) + EG-Arabic child-speech benchmark. → USAM-VOICE-002/003.

## B. Resolved on baseline (do NOT re-work — proven fixed on `origin/main`)

- Double `/api/api` prefix on characters + learning controllers — fixed (`@Controller('characters')`/`'learning'`).
- `req.user.learnerId` wrong-shape in learning/english controllers — fixed (`req.user.learner?.id`).
- English controller↔service DTO mismatch + `progression.xp` compile break — gone (English controller is read-only strands).
- Auth-specific throttling — present (`@Throttle 20/15min` on register+login).
- World engine — real `World` model + `Mission.worldId` FK.
- Character framework + 15-character seed + strong child-safety on character path — real.
- i18n + RTL — real and near-complete.

## C. Research / decision / legal (from 17_RESEARCH_BACKLOG)

R-1..R-28 remain open; none are given fabricated conclusions. The 6 mandatory research tracks (child-AI safety, adaptive model, English/datasets, age UX, EG-Arabic/voice, competitor UX) plus legal matrix and educational-truth validation gate several P0/P1 items.

## D. Overall production-readiness verdict

Current `origin/main` is a **broad, largely real platform** (strong data model, learning chain, character framework, safety core, i18n) that is **not yet production-ready** because of: one critical auth escalation, an IDOR, unprotected coach-AI paths, faked/placeholder learning signals (pronunciation, translation), missing billing, thin testing, and a set of educational-depth gaps. It is **fixable without a rebuild** — the correct path is targeted remediation on this baseline, not starting over.
