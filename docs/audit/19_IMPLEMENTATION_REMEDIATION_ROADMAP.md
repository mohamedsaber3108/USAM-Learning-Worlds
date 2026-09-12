# 19 — Implementation & Remediation Roadmap

**Baseline:** `origin/main @ 3a787c0` (verified). **This roadmap is NOT authorized for execution yet** — it is the plan the owner will trigger phase-by-phase, and only after the explicit `FINISH` command. Implementation starts from the real existing system; no rebuild unless a task proves a subsystem must be replaced.

**Priorities:** P0 = critical blocker / child-safety / security. P1 = core production requirement. P2 = important enhancement. P3 = future/strategic.

**Per-task fields:** ID · Requirement IDs · Problem · Evidence · Current state · Why it matters · Dependencies · Affected FE/BE/DB/contracts/engines · OSS candidates · Research needed · Recommendation · Risk · Acceptance criteria · Definition of Done.

---

## P0 — Critical blockers (do first)

### T-P0-1 — Lock down public registration
- **Req:** USAM-IDN-007/008, SEC-001 · **Gap:** GAP-S1
- **Problem:** public `POST /auth/register` accepts `role` incl. ADMIN/MODERATOR and persists it.
- **Evidence:** `register.dto.ts` `@IsEnum(Role) role`; `auth.service.register` writes `dto.role`.
- **Affected:** BE (auth), contracts, DB(none). **FE:** register already sends `LEARNER`.
- **Recommendation:** server-side allowlist — public register may only create `LEARNER`/`GUARDIAN`; ADMIN/MODERATOR created only via admin path. Ignore/reject client-supplied elevated roles.
- **Risk:** low. **Acceptance:** attempting `{role:"ADMIN"}` yields a learner/guardian (or 400); test proves elevated roles are impossible via public register. **DoD:** unit + integration test; smoke passes.

### T-P0-2 — Fix mission-run IDOR
- **Req:** USAM-MIS-001, SEC-001 · **Gap:** GAP-S2
- **Problem:** `getMissionRun(runId)` returns any run without ownership check.
- **Evidence:** `missions.controller.ts` `GET runs/:runId` → `missions.service.getMissionRun(runId)` (no learnerId).
- **Recommendation:** pass `user.learner?.id`, verify `run.learnerId === learnerId`, else 403/404.
- **Risk:** low. **Acceptance:** learner A cannot read learner B's run; test proves 403/404. **DoD:** test + smoke.

### T-P0-3 — Protect coach AI paths with moderation/PII
- **Req:** USAM-SAFE-006 · **Gap:** GAP-S3
- **Problem:** english-coach/coding-coach/legacy ai.controller may bypass moderation + PII.
- **Evidence:** 10_AI audit (re-verify exact call sites on baseline first — R-27).
- **Dependencies:** existing `ModerationService`/`CharacterSafetyService`/`pii-detection`.
- **Recommendation:** route all child-facing AI generation through the same input+output safety pipeline the character path uses; fail-closed.
- **Risk:** medium (latency). **Acceptance:** red-team prompts on coach endpoints are blocked/escalated; test coverage. **DoD:** safety tests green.

### T-P0-4 — Mission completion integrity
- **Req:** USAM-MIS-001, EVID-001 · **Gap:** GAP-S2/BE-M2/M3
- **Problem:** submit doesn't verify the activity belongs to the run's mission; complete stores no outcome.
- **Recommendation:** validate activity∈mission before recording Evidence; on complete, verify required activities attempted/passed, compute score, award XP/progression, store outcome.
- **Risk:** medium. **Acceptance:** off-mission activity submit rejected; completion yields stored score+XP; tests. **DoD:** tests + smoke.

---

## P1 — Core production requirements

### T-P1-1 — Refresh-token strategy redesign
- **Req:** USAM-IDN-003 · **Gap:** GAP-S6/API-3. Add a dedicated refresh strategy (validate refresh token against `JWT_REFRESH_SECRET`, rotation + revocation), align frontend interceptor. **Acceptance:** expired access token refreshes without re-login; revoked refresh token rejected.

### T-P1-2 — XPGain FK integrity
- **Req:** USAM-DB-002, GAM-001 · **Gap:** GAP-D1/D2. Rename/re-target `XPGain.progressionId` (or relate `learnerId`→Learner consistently); add relations to PracticeStreak/StreakFreezePurchase. **Risk:** migration — needs data backfill plan. **Acceptance:** XP ledger joins correctly; drift check passes.

### T-P1-3 — Migration integrity
- **Req:** USAM-DB-002, INFRA-006 · **Gap:** GAP-D3. Adopt real Prisma migrations (or make `check:migrations` a hard CI gate incl. constraint/index drift). **Acceptance:** CI fails on drift; documented apply process.

### T-P1-4 — Spaced review → real FSRS
- **Req:** USAM-REV-002 · **Gap:** GAP-L1 · **OSS:** FSRS (open-spaced-repetition, v6, permissive). Replace naive scheduler. **Research:** R-16. **Acceptance:** review intervals from FSRS state; A/B-ready.

### T-P1-5 — Character Orchestrator
- **Req:** USAM-CHAR-003 · **Gap:** GAP-L2. Add context→character selection/handoff respecting unlock state. **Acceptance:** mission/objective context yields the right mentor; user override preserved.

### T-P1-6 — Evidence → Portfolio → Credential chain
- **Req:** USAM-EVID-001, PORT-002 · **Gap:** GAP-L3 · **Standard:** Open Badges (R-24). Complete the chain. **Acceptance:** a completed project produces verifiable evidence→badge→portfolio entry.

### T-P1-7 — English engine real depth
- **Req:** USAM-ENG-004/005/006/007, LOC-003 · **Gap:** GAP-L4. Real listening/speaking/writing backends; replace pronunciation placeholder (depends on voice T-P1-9); real translation (provider or curated + human-approval workflow). **Research:** R-3. **Acceptance:** no faked scores; CEFR-aligned; content provenance recorded.

### T-P1-8 — AI cost + router decision
- **Req:** USAM-AI-002/003 · **Gap:** GAP-AI1/AI2. Either wire the model router or remove dead code; instrument cost/latency on the Phase-3 path incl. $ per child. **Acceptance:** per-child AI cost visible; routing (if kept) actually selects models.

### T-P1-9 — Voice pipeline + EG-Arabic benchmark
- **Req:** USAM-VOICE-002/003/004 · **Gap:** GAP-M5 · **OSS:** LiveKit vs Pipecat, Whisper/sherpa-onnx. **Research:** R-5/R-15 (benchmark is decision-critical). **Acceptance:** VAD→STT→safety→LLM→TTS with interruption; documented EG-Arabic child-speech accuracy.

### T-P1-10 — Billing/entitlement subsystem
- **Req:** USAM-BILL-001/002 · **Gap:** GAP-D5/M1. Add Subscription/Entitlement/Plan models + parent-only flow + provider abstraction; children never access purchasing. **Research:** R-23. **Acceptance:** parent can subscribe; entitlements gate access; child UI exposes nothing.

### T-P1-11 — Testing foundation
- **Req:** USAM-TEST-001 · **Gap:** GAP-F1. Add frontend test runner (Vitest + Testing Library + axe) and backend integration/contract tests for the P0/P1 fixes; wire into CI. **Acceptance:** CI runs FE+BE tests; the P0 fixes each have a regression test.

### T-P1-12 — Dashboard/state hardening + ErrorBoundary
- **Req:** USAM-FE-002/003 · **Gap:** GAP-F2/F3. Apply existing Skeleton/Error/Empty primitives to Dashboard; add a top-level ErrorBoundary; make auth state reactive; fix stale `User` type. **Acceptance:** loading/error/empty on all core pages; no white-screen on lazy error.

### T-P1-13 — Legal/consent/retention design
- **Req:** USAM-PRIV-001/002 · **Gap:** GAP-S8 · **Research:** R-7/R-8 (needs counsel). Produce jurisdiction matrix + consent + retention/deletion/portability design before scaling data collection.

### T-P1-14 — Code sandbox security review
- **Req:** USAM-CODE-005 · **Gap:** GAP-S5 · **Research:** R-20. Verify/enforce isolation (resource/CPU/memory/network/FS/timeout) before exposing execution.

---

## P2 — Important enhancements

- **T-P2-1** Visual coding (Blockly, Apache-2.0) → USAM-CODE-002 (R-17).
- **T-P2-2** Vector RAG (pgvector-first) + server-side citation validation → USAM-RAG-001/002 (R-14).
- **T-P2-3** Concept-table unification decision → USAM-KG-001 (R-22).
- **T-P2-4** Remove deprecated root `src/` after CI builds only `frontend/`; enforce single deploy → USAM-FE-002 (GAP-F6).
- **T-P2-5** i18n string externalization sweep → USAM-LOC-002.
- **T-P2-6** A11y: focus-trap, reduced-motion, SkipLinks wiring, axe CI → USAM-A11Y-001/003.
- **T-P2-7** Content provenance registry (ContentSource/ContentLicense) → USAM-CMS-001/003.
- **T-P2-8** Nest exceptions instead of raw `throw new Error` → USAM-BE-001.
- **T-P2-9** Offline/PWA/low-bandwidth → USAM-INFRA-002.
- **T-P2-10** Analytics layering (product/learning/AI) + anti-gaming → USAM-ANALYT-002/005.
- **T-P2-11** Merge dual AI call paths; remove legacy `BedrockService` → cleanup 16.
- **T-P2-12** Cleanup: delete `*.backup`, stray `p.$disconnect())`, reject `agent-frontend-rtl-audit-v1` → cleanup 16.
- **T-P2-13** Mood/talking character animation states → USAM-AVATAR-002.

## P3 — Future / strategic

- School/B2B (LTI/OneRoster) → USAM-SCHOOL-001. DR/capacity/CDN → USAM-INFRA-003/004/005. Learner avatar builder → USAM-AVATAR-001. Community V1 decision + moderation → USAM-COMMU-002 (R-21). Standards adoption (xAPI/Caliper) → USAM-OSS-002.

---

## Dependency ordering (execution sequence when triggered)

1. **Safety/security P0** (T-P0-1..4) — independent, do first.
2. **Auth/refresh + DB integrity** (T-P1-1, T-P1-2, T-P1-3) — foundation for everything writing data.
3. **Testing foundation** (T-P1-11) — in parallel, gates all later work.
4. **Learning depth** (T-P1-4/5/6/7) — after DB integrity.
5. **Voice** (T-P1-9) — gated by EG-Arabic benchmark (R-5); unblocks pronunciation in T-P1-7.
6. **AI cost/router + RAG** (T-P1-8, T-P2-2).
7. **Billing** (T-P1-10) — needs entitlement design (R-23).
8. **Legal/consent** (T-P1-13) — parallel research track, gates data-scaling and billing launch.
9. **P2 polish + cleanup**, then **P3**.

## Governance

- No task executes until the owner triggers its phase AND has said `FINISH` for full implementation.
- Each task: audit-confirm on the real baseline → implement → `nest build`/`npm run build`/lint + tests → re-audit → stop for next phase.
- Preserve working code; deletions only after dependency trace + post-delete smoke pass.
- Research/legal/educational items (R-1..R-28) resolved in their tracks before dependent implementation.
