# USAM API Boundaries

**Date:** 2026-08-12
**Phase:** Educational Core Foundation

---

## Existing API Modules (49 Endpoints) — PRESERVE

All existing endpoints remain. New endpoints extend the API.

---

## Proposed New API Boundaries

### /api/learning-graph (NEW)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/concepts` | List concepts (filterable by competencyId, domainId) |
| GET | `/concepts/:id` | Get concept with prerequisites and dependents |
| GET | `/concepts/:id/prerequisites` | Get prerequisite chain |
| GET | `/concepts/:id/unlock-status` | Check if learner has met prerequisites |
| GET | `/paths` | List learning paths (filterable by domainId, ageBand) |
| GET | `/paths/:id` | Get path with nodes and progress |
| GET | `/paths/:id/progress` | Get learner's progress through path |
| GET | `/graph/domain/:domainId` | Get full domain skill graph |
| GET | `/graph/recommendations` | Get graph-aware next steps |

### /api/content (NEW)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/content` | List content items (filterable) |
| GET | `/content/:id` | Get content item |
| POST | `/content/generate` | Generate content with educational constraints |
| POST | `/content/:id/validate` | Validate content against criteria |
| PATCH | `/content/:id/status` | Update content lifecycle status |
| GET | `/content/by-objective/:objectiveId` | Get content for objective |

### /api/age-adaptation (NEW)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/age-config/:ageBand` | Get age-band configuration |
| GET | `/variants/:entityType/:entityId` | Get age variants for entity |
| GET | `/adapted-content/:activityId` | Get activity adapted for learner's age |

### /api/events (NEW)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/events` | Record learning event |
| GET | `/events/learner/:learnerId` | Get learner's event stream |
| GET | `/events/session/:sessionId` | Get session events |
| GET | `/events/analytics` | Get aggregated learning analytics |

### /api/characters (NEW — extends existing Character model)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/characters` | List available characters |
| GET | `/characters/:id` | Get character details |
| GET | `/characters/:id/state` | Get character state for current learner |
| POST | `/characters/:id/interact` | Record character interaction |
| GET | `/characters/:id/context` | Get character's current learning context |

### /api/domains (EXTEND existing)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/domains` | Already exists ✓ |
| GET | `/domains/:id` | Get domain with skills tree |
| GET | `/domains/:id/progress` | Get learner's domain progress |
| GET | `/domains/:slug/curriculum` | Get full curriculum for domain |

---

## API Contract Notes

### Naming Conventions (Match Existing)
- REST with resource-based URLs
- camelCase for JSON fields
- UUID for all IDs
- JWT Bearer authentication
- Global `/api` prefix
- NestJS controller decorators

### Response Format (Match Existing)
```typescript
// Success
{ ...data }

// Error
{
  statusCode: number,
  message: string | string[],
  error: string
}
```

### Authentication (Match Existing)
- `@UseGuards(JwtAuthGuard)` on all protected routes
- `@CurrentUser()` decorator for learner context
- `@Roles('GUARDIAN')` for parent-only routes

---

## Frontend Contract Alignment

### src/ Frontend Expects (from services/contracts.ts):

| Contract | Backend Coverage | Gap |
|----------|-----------------|-----|
| AuthService | ✓ Implemented | None |
| CurriculumService | PARTIAL (domains/skills exist) | No graph, no age variants, no world map |
| MasteryService | ✓ Implemented | None |
| MissionService | ✓ Implemented | Mission-activity link broken |
| ProjectService | ✓ Implemented | No milestones/rubrics |
| ProgressionService | ✓ Implemented | None |
| RecommendationService | ✓ Implemented | No interest/engagement factors |
| CharacterService | SCHEMA_ONLY | No behavior, no context, no conversation |
| VoiceService | MISSING | Full STT/TTS infrastructure |
| CommunityService | ✓ Implemented (basic) | No guilds/teams |
| ParentService | ✓ Implemented | None |
| ModerationService | ✓ Implemented | None |
| AnalyticsService | MISSING | Event telemetry |
| ContentGenerationService | PARTIAL | Only hints/feedback/explain |
| NotificationService | MISSING | Full notification system |
| SearchService | BASIC | Full-text needed |

### frontend/ (Deployed) Expects:

| Endpoint | Coverage |
|----------|----------|
| POST /auth/login | ✓ |
| POST /auth/refresh | ✓ |
| GET /auth/me | ✓ |
| GET /gamification/progression | ✓ |
| GET /gamification/leaderboard | ✓ |
| GET /gamification/achievements | ✓ |
| GET /gamification/streak | ✓ |
| GET /gamification/rank | ✓ |
| GET /mastery/overview | ✓ |
| GET /missions | ✓ |
| GET /missions/:id | ✓ (broken activity link) |
| POST /missions/:id/start | ✓ |
| GET /missions/runs/:runId | ✓ |
| POST /missions/runs/:runId/submit | ✓ |
| POST /missions/runs/:runId/complete | ✓ |
| GET /missions/history/me | ✓ |
| GET /projects/my | ✓ |
| GET /adaptive/zpd | ✓ |
| GET /adaptive/recommendations | ✓ |
| GET /community/feed | ✓ |
| GET /parents/children | ✓ |
