# 44 — IMPLEMENTATION SEQUENCE

> How the rebuild executes inside the ONE app (root `src/`, pending owner confirm
> — 37 §1). Plans drive code; code updates plans. Work in controlled phases;
> each phase ends green (build + tests) and updates STATUS + 45 truth table.

Date: 2026-09-30

---

## 0. Preconditions

- Owner confirms rebuild target = root `src/` (recommended). [BLOCKS execution]
- Backend reachable for shape verification (dev DB or live `/api`). If not
  reachable from this workspace, shape-verify by reading controllers/DTOs +
  defer live verification to the server (document, don't fake — 46).

## 1. Phase A — Foundation wiring (unblocks everything)

1. Consolidate ONE typed API client under `/api` (merge `src/services/api.ts` +
   `contracts.ts`) with auth token + refresh + error conventions (40 §4).
2. Wrap app in `AgePresentationProvider` (22). TanStack Query client.
3. Auth real: login/register/me/refresh; session + role routing + guards (18).
Gate: a real learner can log in and land on a role home.

## 2. Phase B — Correct the product shape (backend seed)

4. Replace default `seed.ts`: 4 domains (English/Coding/AI/Entrepreneurship) +
   15 characters (already in `seed-character-universe.ts`) + worlds; retire the
   12 school-subject domains. Idempotent upsert (13 §4 item 1).
5. Wire cross-curricular concept tables into the Domain→Skill→Competency graph.
Gate: domains/worlds/characters reflect locked scope.

## 3. Phase C — Core learning loop (real, end-to-end)

6. Learn hub → domain path → mission detail → mission player (teach→practice) →
   submit → Evidence → mastery → review → recommendation. Wire behind contracts
   (verify each shape). Coding sandbox (Pyodide/Sandpack) trust loop.
7. Practice (FSRS review) + Progress (mastery/balanced) real.
Gate: one full learner loop runs on real APIs for each domain's seeded slice.

## 4. Phase D — First-run + session engine

8. Rebuild onboarding to the §15 flow (Welcome→Azouz→…→first success→next).
9. Home = living world (adaptive recommendations, daily goal, Azouz greeting).
10. Session engine wiring: adaptive consumes age+interests+cognitive-load+
    objective (31) — A/B via experimentation.
Gate: a new child, no adult, completes first-run → first mission → sees next.

## 5. Phase E — Companions + voice

11. Reconcile frontend characters to the 15 (23 §2); Companions surface + in-
    mission mentor + Azouz orchestration.
12. Voice woven (mic → `/voice/turn` → TTS, captions always); age voice-first;
    entitlement-gated.
Gate: Azouz + a specialist guide a mission; voice works (EG-Arabic verified later).

## 6. Phase F — Create / projects / portfolio / credentials

13. Projects workspace (milestones/rubric/submit/reflection) → Evidence.
14. Portfolio + credentials (Open Badges) wired; export gated.
Gate: a learner builds an artifact → portfolio + credential.

## 7. Phase G — Entrepreneurship content (thinnest domain)

15. Author Entrepreneurship vertical slice + A1 breadth seed (28/13) — Problem→…→
    Pitch skills/competencies/missions/projects per band.
Gate: Entrepreneurship runs the full loop like the other three.

## 8. Phase H — Parent + moderator + admin

16. Parent surfaces (16/34): children, child detail, plan, privacy, reports.
17. Moderator (35): escalations/community/interventions queue.
18. Admin (17): content/curriculum/AI&safety/analytics/platform (task-oriented).
Gate: each role completes its journey on real data.

## 9. Phase I — Commerce

19. Seed/verify 4 plans; wire gates (`hasFeature`/`getLimit`): missionsPerDay,
    voice, aiTutor, maxLearners + usage meter. Pricing/upgrade UI (configurable
    display). Real payment gateway = owner-gated separate slice (11 §6).
Gate: entitlement gating works; FREE caps enforced server-side.

## 10. Phase J — Harden + QA + cutover (Gate-5 execution tail)

20. i18n EN/AR + RTL pass; a11y pass; states (loading/empty/error/restricted).
21. Tests (42); build green; honest visual/live QA (46) — observed, not assumed.
22. Deprecate `frontend/` + any preview (41). ONE app remains.
Gate: 46 acceptance for 8/10/12/14 child personas + parent, observed.

## Ordering rule

A phase does not start until the prior phase's gate is green. Each phase: wire →
verify shape → test → commit → update STATUS + 45. Never mark PRODUCTION_READY
without evidence.
