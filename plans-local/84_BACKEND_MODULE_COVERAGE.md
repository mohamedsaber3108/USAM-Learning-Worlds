# 84 — Backend Module → Frontend Coverage

> Every backend module (42) + controller (~59) classified against the NEW
> frontend. Classification: `PUBLIC` / `LEARNER` / `GUARDIAN` / `MODERATOR` /
> `ADMIN` / `INTERNAL` (no direct UX — feeds other features/telemetry). For each:
> does it need frontend representation, and where is it. No capability silently
> forgotten. Source: code-traced inventory + implemented routes in
> `frontend-rebuild/`.

## Module coverage

| # | Module | Role(s) | Needs FE? | New FE surface | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | auth | PUBLIC/ALL | YES | /login, /signup, /onboarding, /app/settings | DONE |
| 2 | entitlements | PUBLIC/GUARDIAN | YES | /pricing, /parent/plan | DONE |
| 3 | worlds | LEARNER | YES | /app/learn | DONE |
| 4 | learning (concepts/paths/domain-path/english/stories/translation) | LEARNER + ADMIN(translations) | YES | /app/learn/:slug (domain path), /app/stories; translations → /admin/curriculum (deferred sub) | DONE (core); translations admin = PARTIAL |
| 5 | missions (+admin) | LEARNER + ADMIN | YES | /app/missions/:id, /app/runs/:runId; /admin/curriculum (missions list) | DONE |
| 6 | coding-sandbox | LEARNER | YES | CodingActivityPanel in mission player (lazy) | DONE |
| 7 | mastery | LEARNER | YES | /app/progress, /app/practice | DONE |
| 8 | adaptive | LEARNER | YES (surfaced) | /app (recommendations feed) | DONE (home surfacing; deeper views INTERNAL) |
| 9 | flashcards | LEARNER | YES | /app/practice (review) | DONE |
| 10 | reflection | LEARNER | YES | mission player step; parent reflections tab | DONE |
| 11 | questions | INTERNAL | NO | activity content generation (backs missions) | INTERNAL |
| 12 | learner-model | INTERNAL | NO | feeds adaptive; no dedicated page | INTERNAL |
| 13 | gamification | LEARNER | YES | /app/rewards, home progression | DONE |
| 14 | daily-goals | LEARNER | YES | home surfacing | DONE (widget) |
| 15 | notifications | ALL | YES | /app/notifications | DONE |
| 16 | credentials | LEARNER + PUBLIC verify | YES | /app/credentials, /verify/:uid | DONE |
| 17 | creativity | LEARNER | YES | /app/create | DONE |
| 18 | projects (+rubrics) | LEARNER | YES | /app/projects, /app/projects/:id, /app/portfolio | DONE |
| 19 | ai (character) | LEARNER | YES | /app/companions | DONE (gallery; live chat = follow-on) |
| 20 | ai (tutor/coach) | LEARNER | YES | inline AI help (hint/explain within player) | PARTIAL (inline hooks; dedicated coach chat = follow-on) |
| 21 | ai (safety-escalation) | MODERATOR/ADMIN | YES | /mod/escalations | DONE |
| 22 | ai (admin: prompt-templates/safety-policies/ai-eval/memory-governance) | ADMIN | YES | /admin/ai; memory-governance withheld (backend authz gap) | DONE (memory-gov intentionally not exposed) |
| 23 | community | LEARNER + MODERATOR | YES | /app/community, /mod/community | DONE |
| 24 | search | LEARNER | YES | /app/search | DONE |
| 25 | parents | GUARDIAN | YES | /parent, /parent/child/:id | DONE |
| 26 | legal | GUARDIAN | YES | /parent/privacy | DONE |
| 27 | voice | LEARNER | YES (gated) | /app/voice (PROVIDER-GATED honest state) | BLOCKED_EXTERNAL |
| 28 | cross-curricular | LEARNER | YES | consumed in /app/learn (content) | DONE (surfaced within Learn) |
| 29 | problem-solving (problem/computational/critical) | LEARNER | YES | consumed in /app/learn | DONE (surfaced within Learn) |
| 30 | simulation | LEARNER | YES | /app/simulations | DONE (catalog; player follow-on) |
| 31 | visual-language | LEARNER | YES | consumed in /app/learn | DONE (surfaced) |
| 32 | media | INTERNAL/LEARNER | NO(dedicated) | asset delivery inside surfaces | INTERNAL |
| 33 | content-items (admin) | ADMIN | YES | /admin/content (CMS lifecycle) | DONE |
| 34 | content-provenance (admin) | ADMIN | YES | /admin (provenance sub — deferred to curriculum area) | PARTIAL |
| 35 | content-qa (admin) | ADMIN | YES | /admin/curriculum (QA flags) | DONE |
| 36 | assessment-quality (admin) | ADMIN/MOD | YES | /admin/curriculum | PARTIAL (flags via QA pattern) |
| 37 | difficulty-calibration (admin) | ADMIN | YES | /admin/curriculum | PARTIAL |
| 38 | misconceptions (admin) | ADMIN | YES | /admin/curriculum | DONE |
| 39 | curriculum-mapping (admin) | ADMIN | YES | /admin/curriculum | PARTIAL (suggest/apply follow-on) |
| 40 | interventions (admin/mod) | MODERATOR/ADMIN | YES | /mod/interventions | DONE |
| 41 | analytics (admin) | ADMIN | YES | /admin/analytics | DONE |
| 42 | audit | ADMIN | YES | /admin/platform (audit log) | DONE |
| — | feature-flags | ADMIN | YES | /admin/platform | DONE |
| — | experimentation | ADMIN | YES | /admin/platform | DONE |

## Summary

- Modules with a required user-facing surface: all mapped. **DONE**: 33.
  **PARTIAL** (represented, deeper sub-tools are follow-ons within an existing
  area, not missing routes): 7 (translations admin, AI coach chat, provenance,
  assessment-quality, difficulty-calibration, curriculum-mapping suggest/apply).
  **BLOCKED_EXTERNAL**: 1 (voice). **INTERNAL** (correctly no dedicated UX): 4
  (questions, learner-model, media, plus adaptive deep views).
- No module is silently forgotten. PARTIAL items are additive depth inside an
  existing admin/learner area; none is a missing required route or a fake
  feature. They are tracked here for the completeness audit.
- `career/jobs/org/teacher`: NON-EXISTENT in backend — correctly absent.
