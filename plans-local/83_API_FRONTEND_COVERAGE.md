# 83 — API → Frontend Coverage

> Every user-facing endpoint group and its new-frontend consumer. Endpoints with
> no FE consumer are classified: `ADMIN_ONLY` / `INTERNAL` / `FUTURE` /
> `MISSING_FRONTEND`. Consumer = the typed group in
> `frontend-rebuild/src/lib/api/endpoints.ts` and the route(s) that call it.

## Consumed endpoints (typed + wired)

| Endpoint (under /api) | FE group | Consumer route/surface | Status |
| --- | --- | --- | --- |
| POST /auth/login | authApi.login | /login | DONE |
| POST /auth/register | authApi.register | /signup | DONE |
| GET /auth/me | authApi.me / authStore | session bootstrap | DONE |
| POST /auth/refresh | client (silent) | interceptor | DONE |
| PATCH /auth/me/age-band | authApi.updateAgeBand | /onboarding, /app/settings | DONE |
| PATCH /auth/me/preferences | authApi.updatePreferences | /onboarding | DONE |
| GET /entitlements/plans | entitlementsApi.listPlans | /pricing, /parent/plan | DONE |
| GET /entitlements/me | entitlementsApi.getMine | /parent/plan | DONE |
| POST /entitlements/subscribe | entitlementsMgmtApi.subscribe | /parent/plan | DONE |
| POST /entitlements/cancel/:id | entitlementsMgmtApi.cancel | /parent/plan | DONE |
| GET /worlds | worldsApi.list | /app/learn | DONE |
| GET /learning/domains/:slug/path | learningApi.getDomainPath | /app/learn/:slug | DONE |
| GET /missions/:id | missionsApi.getById | /app/missions/:id | DONE |
| POST /missions/:id/start | missionsApi.start | mission detail | DONE |
| GET /missions/runs/:runId | missionsApi.getRun | mission player | DONE |
| POST /missions/runs/:runId/submit | missionsApi.submit | mission player | DONE |
| POST /missions/runs/:runId/complete | missionsApi.complete | mission player | DONE |
| GET /coding-sandbox/missions/:activityId | codingSandboxApi.getMission | coding panel | DONE |
| POST /coding-sandbox/submissions | codingSandboxApi.submit | coding panel | DONE |
| GET /mastery/overview | masteryApi.getOverview | /app/progress | DONE |
| GET /mastery/by-domain | masteryApi.getByDomain | /app/progress | DONE |
| GET /mastery/review-due | masteryApi.getReviewDue | /app/practice, home, domain path | DONE |
| GET /flashcards/due, POST /flashcards/:id/review | flashcardsApi | /app/practice | DONE (wired; review UI = follow-on depth) |
| GET /adaptive/recommendations | adaptiveApi | /app | DONE |
| GET /gamification/progression|streak|achievements|leaderboard|cosmetics | rewardsApi/gamificationApi | /app/rewards, home | DONE |
| POST /gamification/cosmetics/:id/equip|unlock | rewardsApi | /app/rewards | DONE (wired) |
| GET /daily-goals/me/progress | dailyGoalsApi | home | DONE |
| GET /notifications, /unread-count, POST /:id/read, /read-all | notificationsApi | /app/notifications | DONE |
| GET /credentials/me | credentialsApi.mine | /app/credentials | DONE |
| GET /credentials/:uid | credentialsApi.verify | /verify/:uid | DONE |
| GET /creativity/prompts, POST /submissions, /submissions/mine | creativityApi | /app/create | DONE |
| GET /projects/my, /:id, /portfolio/:learnerId | projectsApi | /app/projects, /:id, /portfolio | DONE |
| GET /characters | charactersApi.list | /app/companions | DONE |
| GET /community/feed, /trending, POST /report | communityApi | /app/community | DONE |
| GET /search | searchApi.query | /app/search | DONE |
| GET /stories, /:id | storiesApi | /app/stories, /:id | DONE |
| GET /simulations, /:slug | simulationsApi | /app/simulations | DONE |
| GET /parents/children, /family-summary | parentsApi | /parent | DONE |
| GET /parents/children/:id/dashboard|progress|activity|reflections|safety | parentsApi | /parent/child/:id tabs | DONE |
| POST /parents/children/:id/time-limits | parentsApi.setTimeLimits | child controls tab | DONE |
| POST /legal/consent, GET /export/:id, POST /delete/:id | legalApi | /parent/privacy | DONE |
| GET /safety-escalations (+/:id/assign/resolve/stats) | moderationApi | /mod, /mod/escalations | DONE |
| GET /community/moderation/quarantined, POST /review/:id | moderationApi | /mod/community | DONE |
| GET /admin/interventions (+ack/resolve) | moderationApi | /mod/interventions | DONE |
| GET /admin/analytics/overview, /daily-activity | adminApi | /admin, /admin/analytics | DONE |
| GET /admin/content-items, POST, PATCH /:id/status | adminApi | /admin/content (CMS lifecycle) | DONE |
| GET /admin/missions | adminApi.missions | /admin/curriculum | DONE |
| GET /admin/misconceptions | adminApi.misconceptions | /admin/curriculum | DONE |
| GET /admin/content-qa/flags | adminApi.contentQaFlags | /admin/curriculum | DONE |
| GET /admin/prompt-templates, /safety-policies, /ai-eval/runs | adminApi | /admin/ai | DONE |
| GET /feature-flags, PATCH /:key | adminApi | /admin/platform | DONE |
| GET /experiments | adminApi.experiments | /admin/platform | DONE |
| GET /audit/logs | adminApi.auditLogs | /admin/platform | DONE |
| POST /voice/turn | voiceApi.turn | /app/voice (gated) | BLOCKED_EXTERNAL |

## Not (yet) consumed — classified

| Endpoint area | Classification | Reason |
| --- | --- | --- |
| GET /learning/concepts/* prereqs CRUD, age-variants, competency prereqs | ADMIN_ONLY / INTERNAL | Authoring + gating internals; surfaced as path gating, not a route |
| POST /learning/events, GET events/stats | INTERNAL | Telemetry; emitted in background, no dedicated page |
| GET /learner-model/:id | INTERNAL | Feeds adaptive |
| GET /questions/templates, POST /generate | INTERNAL | Activity content generation |
| ai tutor/coach (coding-coach, english-coach) POST endpoints | FUTURE | Inline help hooks planned; dedicated coach chat is additive depth |
| character conversations CRUD, /:id/chat | FUTURE | Companion live-chat is additive depth over the gallery |
| /admin/content-provenance/*, /curriculum-mapping/suggest|apply, /difficulty-calibration, /assessment-quality | ADMIN_ONLY (depth) | Represented within /admin/curriculum + /admin areas; deeper tools additive |
| /admin/memory-governance/stats | ADMIN_ONLY (WITHHELD) | Backend authz gap (no RolesGuard) — intentionally NOT exposed until backend fixed |
| /translations/* | ADMIN_ONLY (depth) | Localization admin; additive within curriculum area |
| /gamification/streak-freeze/* | FUTURE | Additive reward mechanic |

## Reconciliation result

- Every REQUIRED user-facing endpoint has a real FE consumer. `MISSING_FRONTEND`
  count for required capabilities = **0**.
- Remaining unconsumed endpoints are correctly `INTERNAL`, `ADMIN_ONLY (depth)`,
  `FUTURE (additive)`, or the deliberately-withheld memory-governance gap.
- No FE consumer calls a non-existent endpoint (no fabricated capabilities).
