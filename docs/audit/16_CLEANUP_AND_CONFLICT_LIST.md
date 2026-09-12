# 16 — Cleanup & Conflict List

**Baseline:** `origin/main @ 3a787c0`. Every listed item is classified KEEP / REFACTOR / REPLACE / DELETE / MERGE / COMPLETE. Nothing is deleted in this phase — dependencies must be traced first, and removal happens only after approval.

## Duplicated / conflicting

| Item | Evidence | Classification | Notes |
|---|---|---|---|
| Two frontends: `frontend/` (real) vs root `src/` TanStack (mock) | `FRONTEND_ARCHITECTURE_DECISION.md`; root `src/services/*` mock-heavy | **DELETE (root `src/`)** after CI builds only `frontend/` | Do NOT delete until deployment enforced; big blast radius — trace first |
| Two AI call paths: `AIProviderService` (Phase-3) vs legacy `BedrockService` | ai.module + bedrock.service | **MERGE** onto one path | Legacy path is unmoderated (SAFE-006) and unlogged-elsewhere |
| ~11 domain-specific concept tables vs generic `Concept` | schema DB-3 | **REFACTOR/MERGE (design decision)** | Decide: unify under Concept/Competency graph or keep bespoke — needs design |
| AI model router (dead code) | `ai-provider.service.selectModel/executeTask` never called | **COMPLETE or DELETE** | Either wire it (USAM-AI-002) or remove the dead stub |
| Duplicated `formatRetrievedContext` in character/english/coding services | 10_AI audit | **REFACTOR (extract shared)** | |

## Legacy / stray artifacts

| Item | Classification | Notes |
|---|---|---|
| `backend/src/modules/ai/character.controller.ts.backup` | **DELETE** | committed backup file; verify no import |
| `backend/p.$disconnect())` stray file | **DELETE** | shell artifact |
| `origin/agent-frontend-rtl-audit-v1` branch | **REJECT** | targets deprecated root app; RTL already in `frontend/` |
| `bun.lock` at root (project uses npm) | **DELETE (verify)** | earlier merge notes removed stray bun locks |
| Old local workspace `M:\USAM Learning Worlds` (unrelated history) | **KEEP as legacy reference, never merge** | 358 commits behind; no merge base |

## Placeholder / stub to complete (not delete)

| Item | Classification | Notes |
|---|---|---|
| `translation.autoTranslate` `[AR-EG]` placeholder | **COMPLETE** | replace with real provider/curated content (USAM-LOC-003) |
| Pronunciation `0.85` hardcoded score | **COMPLETE/REPLACE** | needs STT+phoneme (USAM-ENG-006/VOICE) |
| `character.service.logInteraction` stale "table doesn't exist" comment | **REFACTOR** | table exists; use typed Prisma create, remove swallowed catch |
| Stale endpoints.ts comment "/characters not live" | **REFACTOR** | backend implements it; fix prefix (API-1) then update comment |
| Frontend mock `FALLBACK_ROSTER` in CharacterGalleryPage | **REFACTOR** | reduce to true offline/error fallback once API-1 fixed |

## KEEP (working, preserve)

Learning chain models, KG/prereq tables, Mastery/Evidence, World FK, character framework + 15-character seed, child-safety services, i18n/RTL system, shared FE state primitives (`CharacterState`, `Skeleton`), admin/ops pages, red-team harness, migration drift checker, adaptive services (ZPD/recommendation/interleaving/transfer), analytics/experiments/feature-flags.

## Rule

No deletion or large refactor executes until: dependencies traced, the specific phase approved, and (for deletes) build + smoke pass afterward. This list is a plan, not an action log.
