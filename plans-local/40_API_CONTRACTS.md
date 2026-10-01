# 40 — API CONTRACTS

> The contract surface the frontend binds to. All under global prefix `/api`.
> Frontend talks ONLY to typed service contracts (`src/services/contracts.ts`),
> implemented against these endpoints. VERIFY each real response shape in G5 via
> an actual call before wiring — do not assume shapes.

Date: 2026-09-30

---

## 1. Endpoint groups (verified controller prefixes, under /api)

auth · mastery · missions · ai + characters · adaptive · projects · gamification
· community · parents · learning + learning/domains + english + english-coach +
coding (coding-coach, coding-sandbox) · computational-thinking · critical-thinking
· problem-solving · creativity · cross-curricular · credentials · daily-goals ·
flashcards · entitlements · experiments · feature-flags · learner-model · legal ·
media · notifications · questions · reflection · rubrics · safety-escalations ·
search · simulations · stories · translations · visual-language · voice · worlds
· audit · admin/* (ai-eval, analytics, assessment-quality, content-items,
content-provenance, content-qa, curriculum-mapping, difficulty-calibration,
interventions, memory-governance, misconceptions, missions, prompt-templates,
safety-policies).

## 2. Key verified contracts (anchors; verify rest in G5)

- `POST /auth/login` · `POST /auth/register` · `GET /auth/me` ·
  `POST /auth/refresh` · `PATCH /auth/me/age-band` · `PATCH /auth/me/preferences`.
- `GET /voice/turn`? → actually `POST /voice/turn` (STT→response→TTS).
- Characters: `GET /characters/:ageBand/active`, `/orchestrate`, `/unlocked`,
  `POST /characters/:id/chat`, conversation lifecycle `/conversations/*`, coach
  `hint|explain|review|challenge|grammar|pronunciation|vocabulary|reading`,
  moderation `moderate|moderation/stats|quarantined`.
- Learning/missions/mastery shapes from prior verification (carry forward, but
  RE-VERIFY against this checkout): mission run activities under
  `run.mission.activities`; submit → `{attempt, evaluation:{correct,score,
  feedback}, activity, diagnosticOnly}`; domain path → `{domain, skills[
  {competencies[{masteryState,cefrLevel,strandType}]}]}`; mastery overview /
  by-domain / review-due; coding submit → `{passed,score,coachFeedback,
  testsPassed,testsTotal}`; parents progress/activity/safety; age enum mapping.

## 3. Contract discipline (the migration rule)

1. For each surface, define/confirm the typed contract in `src/services/*`.
2. Implement the contract against the real `/api` endpoint, VERIFYING the actual
   JSON shape with a real call (not assumption) — grep doesn't index backend, so
   read the controller/DTO or call the live API.
3. Swap the mock body for the real one; the page is unchanged.
4. Record each wired contract + its verified shape in 45 (feature truth table)
   with evidence.

## 4. Error / auth conventions

JWT bearer; 401 → refresh → re-login; 403 wrong-role → honest restricted state;
404 honest; entitlement-gated endpoints (e.g. missionsPerDay cap) → 403 with a
clear upgrade affordance. Treat all external/API data as untrusted; validate.

## 5. Open shape-verification list (G5)

voice turn I/O · entitlements plans/me/subscribe · credentials verify/issue ·
notifications list/unread · search · daily-goals · reflection · stories/
simulations detail · admin content/curriculum/ai/analytics. Each verified before
"done".
