# 38 — BACKEND ARCHITECTURE

> The backend is MATURE and is the source of truth (96 models, ~56 controllers,
> ~47 modules). This doc documents its shape; the reconstruction mostly CONSUMES
> it (frontend wiring) + fixes seed/wiring gaps — it does NOT rebuild the backend.

Date: 2026-09-30

---

## 1. Stack

NestJS + Prisma + PostgreSQL + Bull/Redis (async mastery recompute). Global
prefix `/api` (main.ts). JWT auth + `RolesGuard`. Helmet + compression + CORS +
global ValidationPipe.

## 2. Module groups (~47 — verified)

- Learning core: learning, missions, mastery, adaptive, questions, learner-model,
  difficulty-calibration, misconceptions, assessment-quality, interventions.
- Domains: english-learning (+english/english-coach), coding-sandbox (+coding-
  coach), computational-thinking, cross-curricular, creativity, problem-solving,
  critical-thinking, (AI via ai module), simulation, visual-language.
- Experience: ai (characters + conversation + coach + moderation), voice, worlds,
  stories, gamification, daily-goals, flashcards, reflection, media, search,
  notifications.
- Commerce/governance: entitlements, credentials, projects, rubrics, content-
  items, content-qa, content-provenance, curriculum-mapping, feature-flags,
  experimentation, audit, legal, safety-escalations, parents, auth.

## 3. Known backend work (not a rebuild — targeted fixes)

- Default seeder (`seed.ts`) → replace with 4-domain + 15-char + worlds seed (13).
- Wire cross-curricular concept tables into the Domain→Skill→Competency graph (08).
- Adaptive engine → consume age + interests + cognitive-load (31, PG-11).
- Usage meter for `voiceMinutes`/`missionsPerDay` (10 §6).
- Memory-governance admin authz fix (35 §2) before exposing.
- Auth depth: add password-reset / email-verification / refresh-rotation if
  product requires (PG-21/22) — confirm with owner (not strictly blocking v1).
- Verify rate-limit config (35 §5).

## 4. Async + telemetry

Bull queue recomputes mastery after evidence; `LearningEvent` telemetry feeds
adaptive + analytics. pgvector concept embeddings
(`20260913_add_concept_embeddings_pgvector`) for semantic search/recommendation.

## 5. Payment / voice providers (abstractions — don't hardcode)

`payment-provider.interface.ts` (manual provider today; real gateway external,
owner-gated) + `voice-provider.interface.ts` (Whisper/Piper sidecars). Keep both
provider-independent.

## 6. Rule

Treat the backend as the contract source. Frontend adapts to real response shapes
(verify each in G5 via actual calls, not assumption). Backend changes are
surgical (seed/wiring/authz), tracked in 45 with evidence.
