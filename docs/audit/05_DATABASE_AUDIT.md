# 05 — Database Audit

**Baseline:** `origin/main @ 3a787c0`. `backend/prisma/schema.prisma` = **88 models, 42 enums, ~2374 lines** (registry earlier said 43 enums; actual is 42 — corrected). Read-only evidence.

## Core learning chain — PASS

Real FK relations end-to-end: `Domain→Skill→Competency→LearningObjective→Activity`; knowledge graph `Concept`/`ConceptPrerequisite`/`CompetencyPrerequisite` (self-referential, `@@unique`); `MasteryRecord`(7-state `MasteryState`)+`Evidence`(8-type `EvidenceType`); `Mission`/`World`/`MissionRun`/`ActivityAttempt`/`MissionActivity` join; `Project`/`ProjectMilestone`/`Rubric`/`RubricCriterion`. → USAM-DB-001, USAM-KG-001, USAM-EVID-001, USAM-WORLD-001 pass structurally.

## Defects (with evidence)

| ID | Severity | Finding | Evidence | Maps to |
|---|---|---|---|---|
| DB-1 | **HIGH** | `XPGain.learnerId` is a mis-named/mis-targeted FK — it relates to `Progression.id`, not `Learner.id` | `schema.prisma` XPGain block: `progression Progression @relation(fields: [learnerId], references: [id])`. Only "works" because `Progression.learnerId` is `@unique` (1:1). Any join `XPGain.learnerId → Learner.id` is wrong; index/unique are on progression IDs under a learner-named column. | USAM-DB-002, USAM-GAM-001 |
| DB-2 | MEDIUM | `PracticeStreak.learnerId` and `StreakFreezePurchase.learnerId` have **no `@relation`** — bare indexed strings, no referential integrity | schema PracticeStreak/StreakFreezePurchase blocks | USAM-DB-002, USAM-GAM-001 |
| DB-3 | MEDIUM | Knowledge-graph fragmentation: ~11 parallel domain-specific concept tables duplicate the generic `Concept` idea | EnglishStrand, CodingConcept, AILiteracyConcept, CommunicationSkillConcept, EntrepreneurshipConcept, FinancialLiteracyConcept, DigitalLiteracyConcept, CareerExplorationConcept, ProblemSolvingConcept, ComputationalThinkingConcept, CriticalThinkingConcept | USAM-KG-001, USAM-CMS-001 |
| DB-4 | HIGH | Migration model is manual psql, no `prisma migrate`/`migration_lock.toml`/`_prisma_migrations`; documented recurring drift (once 21 tables, once 10 columns silently unapplied) | 39 flat `.sql` in `migrations/` + 2 in `migrations_manual/`; `scripts/check-migrations-applied.ts` header documents the incidents; `package.json` `prisma:migrate` is dev-only | USAM-DB-002, USAM-INFRA-006 |
| DB-5 | HIGH | **No billing/entitlement layer** — `Subscription`/`Entitlement`/`Plan`/`Payment`/`Invoice`/`Billing` models entirely absent | 0 occurrences in schema | USAM-BILL-001 |
| DB-6 | MEDIUM | No `ContentSource`/`ContentLicense` registry models; provenance is free-text only (`ContentItem.sourceType/createdBy`, `MediaAsset.license/source/attribution`, `AvatarCosmetic.license`). `ContentItem` is described in-code as "mostly orphaned today". | schema ContentItem/MediaAsset blocks | USAM-CMS-001, USAM-CMS-003 |
| DB-7 | MEDIUM | Retention metadata only on 2 AI-memory models (`ConversationMessage.retentionDays=180`, `LearnerContext.retentionDays=90`); no platform-wide retention/TTL (AIUsageLog, LearningEvent, ModerationLog, Evidence, uploads) | schema + `purge-expired-ai-memory.ts` | USAM-PRIV-002, USAM-DB-002 |

## Passing / present

- `MasteryState` 7-state ladder, `CharacterRole` all 15 roles, `ContentStatus` full lifecycle (DRAFT→…→PUBLISHED/DEPRECATED/REJECTED), `ContentSourceType`.
- `AdminAuditLog` satisfies the audit-log entity (different name).
- Parental controls/consent present but minimal: `Guardian.controls Json?`, `Guardianship.consentedAt` + `GuardianshipStatus`.

## Status against registry

- USAM-DB-001: **PASS** (structure). USAM-DB-002: **FAIL/PARTIAL** (XPGain FK, no-relation streak tables, manual-migration drift, narrow retention).
- USAM-KG-001: **PASS but weakened** by concept-table fragmentation.
- USAM-WORLD-001: **PASS** (World is now a real FK, migrated from free string).
- USAM-BILL-001: **MISSING**. USAM-CMS-001: **PARTIAL**. USAM-CMS-003: **PASS** (lifecycle) / **PARTIAL** (provenance registry).
- USAM-GAM-001: **PARTIAL/FAIL** (XPGain FK undermines XP-ledger integrity).
