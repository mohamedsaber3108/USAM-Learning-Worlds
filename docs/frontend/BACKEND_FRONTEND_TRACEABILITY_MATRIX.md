# BACKEND ↔ FRONTEND TRACEABILITY MATRIX

> Every user-facing capability maps: backend capability → API → role → journey →
> surface/route → user action → resulting state. No stranded backend
> capabilities; no fake frontend capabilities. New-FE consumer status:
> `NONE`/`PLANNED`/`BUILDING`/`CONNECTED`/`PRODUCTION_READY`.

## Core learning loop (P0/P1)

| Backend | API | Role | Journey | Route/surface | Action → state | Status |
| --- | --- | --- | --- | --- | --- | --- |
| worlds | `GET /worlds` | LEARNER | pick domain | `/app/learn` | open → READY/EMPTY | PLANNED |
| learning (domain-path) | `GET /learning/domains/:slug/path` | LEARNER | see path | `/app/learn/:slug` | open → READY; locked → ENTITLEMENT_LOCKED | PLANNED |
| missions | `GET /missions/:id` | LEARNER | start mission | `/app/missions/:id` | start → cap→ENTITLEMENT_LOCKED | PLANNED |
| missions | `POST /missions/:id/start` | LEARNER | begin run | player | start → READY/403 cap | PLANNED |
| missions | `POST /missions/runs/:runId/submit` | LEARNER | answer | player | submit → SUCCESS/ERROR; summative retake → EXPIRED | PLANNED |
| missions | `POST /missions/runs/:runId/complete` | LEARNER | finish | player | complete → SUCCESS | PLANNED |
| coding-sandbox | `GET /coding-sandbox/missions/:activityId` + `POST /submissions` | LEARNER | code | player (code panel) | run/submit → SUCCESS/ERROR | PLANNED |
| mastery | `GET /mastery/overview`,`/by-domain`,`/goals` | LEARNER | see mastery | `/app/progress` | open → READY/EMPTY | PLANNED |
| mastery/flashcards | `GET /mastery/review-due`,`/flashcards/due`,`POST /flashcards/:id/review` | LEARNER | review | `/app/practice` | review → SUCCESS; none due → EMPTY(honest) | PLANNED |
| adaptive | `GET /adaptive/recommendations`,`/next-activity` | LEARNER | next step | `/app` | open → READY | PLANNED |
| reflection | `GET /reflection/prompts`,`POST /responses` | LEARNER | reflect | player step | submit → SUCCESS | PLANNED |

## Learner engagement & content

| Backend | API | Route | Status |
| --- | --- | --- | --- |
| gamification | `/gamification/*` | `/app/rewards`, header | PLANNED |
| daily-goals | `/daily-goals/me*` | `/app`, widget | PLANNED |
| notifications | `/notifications*` | shell panel | PLANNED |
| credentials | `/credentials/me`, `/credentials/:uid`(public) | `/app/credentials`, `/verify/:uid` | PLANNED |
| creativity | `/creativity/*` | `/app/create` | PLANNED |
| projects | `/projects/*` | `/app/projects`, `/portfolio` | PLANNED |
| ai (character) | `/characters/*` | `/app/companions`, shell | PLANNED |
| ai (tutor/coach) | `/ai/*`, `/coding-coach/*`, `/english-coach/*` | inline help | PLANNED |
| community/search | `/community/*`, `/search` | `/app/community`, overlay | PLANNED |
| voice | `/voice/turn` | learner feature | BLOCKED_EXTERNAL |

## Guardian

| Backend | API | Route | Status |
| --- | --- | --- | --- |
| parents | `/parents/children`,`/family-summary` | `/parent` | PLANNED |
| parents | `/parents/children/:id/dashboard|progress|activity|reflections|safety` | `/parent/child/:id` | PLANNED |
| parents | `POST /parents/children/:id/time-limits` | `/parent/child/:id` controls | PLANNED |
| legal | `/legal/consent|export|delete` | `/parent/privacy` | PLANNED |
| entitlements | `/entitlements/me|plans|subscribe|cancel` | `/parent/plan` | PLANNED |

## Moderator / Admin

| Backend | API | Route | Status |
| --- | --- | --- | --- |
| ai (safety-escalation) | `/safety-escalations*` | `/mod/escalations` | PLANNED |
| community | `/community/moderation/*` | `/mod/community` | PLANNED |
| interventions | `/admin/interventions*` | `/mod/interventions` | PLANNED |
| content-items | `/admin/content-items*` | `/admin/content` | PLANNED |
| missions (admin) | `/admin/missions*` | `/admin/missions` | PLANNED |
| content-provenance | `/admin/content-provenance*` | `/admin/provenance` | PLANNED |
| curriculum-mapping/content-qa/difficulty/misconceptions/translations | `/admin/*` + translations | `/admin/curriculum` | PLANNED |
| ai (admin) | `/admin/prompt-templates`,`/admin/safety-policies`,`/admin/ai-eval` | `/admin/ai` | PLANNED |
| analytics | `/admin/analytics/*` | `/admin/analytics` | PLANNED |
| feature-flags/experimentation/audit | `/feature-flags`,`/experiments`,`/audit/logs` | `/admin/platform` | PLANNED |

## Stranded / internal (no direct FE — classify, don't fabricate)

| Backend | API | Classification |
| --- | --- | --- |
| learner-model | `GET /learner-model/:id` | INTERNAL (feeds adaptive; no dedicated page) |
| ai (memory-governance) | `/admin/memory-governance/stats` | ADMIN + ⚠ authz gap — fix backend before FE |
| learning (events) | `POST /learning/events` | INTERNAL (analytics telemetry, background) |
| questions | `/questions/*` | INTERNAL (activity content generation) |
| assessment-quality/content-qa/difficulty-calibration | scan/flags | ADMIN_ONLY (QA dashboards) |
| media/visual-language/simulation/stories/cross-curricular/problem-solving | content GETs | Consumed inside learning surfaces, not separate top-level routes |

## Orphan check status

- **Backend without frontend:** none unclassified — every module is REPRESENTED,
  INTERNAL, ADMIN_ONLY, or BLOCKED_EXTERNAL above.
- **Frontend without backend:** none — every planned route cites a real endpoint
  or is static (landing).
- **Fabricated modules:** none — career/jobs/org/teacher explicitly excluded.

Final reconciliation is completed in `plans-local/99_FINAL_SYSTEM_COMPLETENESS_AUDIT.md`.
