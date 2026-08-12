# USAM Gap Register

**Date:** 2026-08-12
**Phase:** Educational Core Foundation - Analysis

---

## Critical Severity

| ID | Requirement | Current State | Expected State | Location | Severity | Engine |
|----|------------|---------------|----------------|----------|----------|--------|
| GAP-001 | Learning Graph with prerequisites | MISSING | Prerequisite relationships, dependency resolution, unlock logic | backend/prisma/schema.prisma | CRITICAL | Learning Graph |
| GAP-002 | Age adaptation in learning delivery | SCHEMA_ONLY (AgeBand enum) | Content variants per age, language complexity, scaffolding level | backend/ (no age-aware logic) | CRITICAL | Age Adaptation |
| GAP-003 | Concept/Subskill model | MISSING | Concepts as atomic learning units between Objective and Competency | schema.prisma | CRITICAL | Learning Model |
| GAP-004 | Learning Path model | MISSING | Ordered sequences of skills/competencies with branching | schema.prisma | CRITICAL | Learning Model |
| GAP-005 | Activity-Mission linkage | BROKEN | Activities are fetched globally (`take: 10`), not per-mission | missions.service.ts:37-39 | CRITICAL | Missions |
| GAP-006 | English learning architecture | MISSING entirely | 14 strands, venues, CEFR progression, conversation AI | No backend code | CRITICAL | English |
| GAP-007 | Coding learning architecture | KEYWORD_ONLY | Concept progression, sandbox adapters, project scaffolding | activity-evaluator.ts (CODE) | CRITICAL | Coding |
| GAP-008 | Content validation pipeline | MISSING | Age check, objective alignment, difficulty calibration, safety | No validation code | CRITICAL | Content |
| GAP-009 | Character behavior engine | SCHEMA_ONLY | Context-aware behavior, learning integration, conversation | Character model only | CRITICAL | Character |

---

## High Severity

| ID | Requirement | Current State | Expected State | Location | Severity | Engine |
|----|------------|---------------|----------------|----------|----------|--------|
| GAP-010 | AI provider abstraction | LOCKED to Bedrock | Provider interface, multi-model routing, fallback | bedrock.service.ts | HIGH | AI Orchestration |
| GAP-011 | Conversation/Memory system | MISSING | Short-term, session, learning, character memory scopes | No code | HIGH | Character/AI |
| GAP-012 | Diagnostic assessment | MISSING | Entry-point assessment to determine starting level | No code | HIGH | Assessment |
| GAP-013 | Project milestones & rubrics | MISSING | Structured project with tasks, rubric, reflection | projects.service.ts | HIGH | Projects |
| GAP-014 | Content generation with constraints | PARTIAL (hints/feedback only) | Full generation with educational constraints | bedrock.service.ts | HIGH | Content Gen |
| GAP-015 | Arabic/Egyptian Arabic support | MISSING | Multilingual content, interface, character speech | No i18n code | HIGH | Language |
| GAP-016 | Learning event telemetry | MISSING | Structured events for adaptation and analytics | No event system | HIGH | Analytics |
| GAP-017 | Misconception tracking | MISSING | Track and remediate common errors per competency | No code | HIGH | Mastery |
| GAP-018 | AI literacy curriculum | MISSING | Age-appropriate AI education progression | No code | HIGH | AI Literacy |
| GAP-019 | Entrepreneurship/Business engine | MISSING | Simulation-based business learning | No code | HIGH | Entrepreneurship |
| GAP-020 | Financial literacy engine | MISSING | Age-appropriate money/finance concepts | No code | HIGH | Financial |

---

## Medium Severity

| ID | Requirement | Current State | Expected State | Location | Severity | Engine |
|----|------------|---------------|----------------|----------|----------|--------|
| GAP-021 | Creative assessment | AUTO_APPROVE | Structured creative evaluation (rubric + AI) | activity-evaluator.ts | MEDIUM | Assessment |
| GAP-022 | Code sandbox execution | KEYWORD_ONLY | Safe execution (Pyodide/Sandpack/containers) | activity-evaluator.ts | MEDIUM | Coding |
| GAP-023 | Voice infrastructure | MISSING | STT/TTS, session management, streaming | No code | MEDIUM | Voice |
| GAP-024 | Notification system | MISSING | In-app, push, parent alerts | No code | MEDIUM | Platform |
| GAP-025 | Full-text search | BASIC (Prisma contains) | Proper search index for content discovery | community.service.ts | MEDIUM | Search |
| GAP-026 | Teams/Guilds/Collaboration | MISSING | Safe team formation, collaborative projects | No code | MEDIUM | Community |
| GAP-027 | Portfolio with evidence | BASIC (project list) | Rich portfolio with artifacts, mastery evidence | projects.service.ts | MEDIUM | Portfolio |
| GAP-028 | Reward/Inventory system | MISSING | Unlockable items earned through learning | No code | MEDIUM | Gamification |
| GAP-029 | World/Region model | FIELD_ONLY (Mission.worldId) | Full world structure with locations, regions | schema.prisma | MEDIUM | Missions |
| GAP-030 | Rate limiting configuration | IMPORTED but not configured | Global + per-route throttling | app.module.ts | MEDIUM | Safety |

---

## Low Severity / Future Phase

| ID | Requirement | Current State | Expected State | Location | Severity | Engine |
|----|------------|---------------|----------------|----------|----------|--------|
| GAP-031 | OAuth2 (Google/Apple) | MISSING | Social sign-in option | No code | LOW | Auth |
| GAP-032 | Real-time features | MISSING | WebSocket for live collaboration | No code | LOW | Platform |
| GAP-033 | A/B experiment framework | MISSING | Feature flags, experiment assignment | No code | LOW | Analytics |
| GAP-034 | Offline support | MISSING | Service worker, sync queue | No code | LOW | Platform |
| GAP-035 | Multi-character conversations | SCHEMA_READY | Characters contextually hand off to each other | Character model | LOW | Character |
| GAP-036 | CI/CD pipeline | MISSING | GitHub Actions, automated tests, deploy | No .github/ | LOW | DevOps |
| GAP-037 | Dockerfile for backend | MISSING | Production container image | Only docker-compose for infra | LOW | DevOps |

---

## Conflicts

| ID | Conflict | Details | Resolution |
|----|----------|---------|------------|
| CONF-001 | Two frontends | `src/` (Lovable, rich types, mock data) vs `frontend/` (deployed, real API) | Backend must serve both; `src/` types are the design authority |
| CONF-002 | Activity-Mission relationship | Schema has no FK; service fetches ALL activities globally | Add mission-activity linking table or FK on Activity |
| CONF-003 | MasteryState naming | Backend: UPPERCASE (NOT_STARTED, MASTERED); src/ types: lowercase (not-started, mastered) | API can return either; frontend transforms |
| CONF-004 | AgeBand format | Backend enum: AGE_8_9; src/ type: "8-9" | API serialization layer handles mapping |
| CONF-005 | CharacterRole values | Backend: GUIDE, MENTOR, COMPANION, CHALLENGER; src/: 14 roles | Extend backend enum in future phase |
| CONF-006 | Domain seed vs requirements | Backend seeds 12 domains; prompt requires 20+ | Extend domain seed data |
| CONF-007 | XPGain.learnerId references Progression.id not Learner.id | Schema FK points to Progression | Bug: should reference learnerId correctly |

---

## Duplications

| ID | What | Where | Resolution |
|----|------|-------|------------|
| DUP-001 | Frontend codebases | `src/` and `frontend/` | `src/` is design reference; `frontend/` is runtime. Not a code dup but an architectural split. |
| DUP-002 | Gap analysis docs | `docs/backend/BACKEND_GAP_ANALYSIS.md` (outdated, says "0% implemented") + this file | This file supersedes the old one |
| DUP-003 | Domain list | Seed data (12 domains) vs this phase requirements (20+ domains) | Extend seed to include all required domains |
