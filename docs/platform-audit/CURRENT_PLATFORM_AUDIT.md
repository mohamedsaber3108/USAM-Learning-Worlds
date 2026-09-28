# USAM Kids — Current Platform Audit (Reconciliation Index)

> **Why this file is an index, not a fresh audit.** The recovery mandate's first,
> non-negotiable rule is: *search whether it already exists; never create a second
> implementation on top of an existing one; NO DUPLICATION.* Applying that rule to
> the mandate itself: a full forensic audit **already exists** in this repository
> from prior recovery runs. Re-authoring it from scratch would be exactly the
> duplication the mandate forbids. This file therefore **reconciles and points to**
> the existing audit corpus and states the true current execution status, so there
> is one entry point without discarding correct prior work.

Branch: `fix/p0-p1-remediation` · HEAD at time of writing: `8a84f03` · Date: 2026-09-23
Live: `https://kids.usamif.com` (frontend) · `https://kids.usamif.com/api` (backend, health `200`)

---

## 1. Where the forensic audit already lives (do not duplicate)

The PHASE 0 forensic audit the mandate describes is already present across three
locations. Read these rather than regenerating them:

### `docs/audit/` — the full subsystem forensic audit (21 docs)
| Doc | Covers |
| --- | --- |
| `00_MASTER_INDEX.md` | Index of the audit set |
| `01_MASTER_REQUIREMENT_REGISTRY.md` | Product requirement registry |
| `02_ENGINE_MATRIX.md` | Engine coverage matrix |
| `03_FRONTEND_AUDIT.md` | Frontend architecture + issues |
| `04_BACKEND_AUDIT.md` | Backend architecture + issues |
| `05_DATABASE_AUDIT.md` | Data model audit |
| `06_API_AND_CONTRACT_AUDIT.md` | API/contract audit |
| `07_ENGINE_CONNECTION_MATRIX.md` | Engine ↔ frontend/backend wiring |
| `08_CHARACTER_SYSTEM_AUDIT.md` | Characters |
| `09_ENGLISH_LEARNING_AUDIT.md` | English engine |
| `10_AI_AND_RAG_AUDIT.md` | AI + RAG |
| `11_VOICE_AND_SPEECH_AUDIT.md` | Voice/STT/TTS |
| `12_SAFETY_PRIVACY_SECURITY_AUDIT.md` | Safety/privacy/security |
| `13_ACCESSIBILITY_SEN_AUDIT.md` | Accessibility |
| `14_OSS_AND_LICENSE_AUDIT.md` | Open-source + licensing |
| `15_GIT_AND_REPOSITORY_STATE.md` | Git/branch state |
| `16_CLEANUP_AND_CONFLICT_LIST.md` | Dead code / conflicts |
| `17_RESEARCH_BACKLOG.md` | Research backlog |
| `18_FINAL_GAP_ANALYSIS.md` | Gap analysis |
| `19_IMPLEMENTATION_REMEDIATION_ROADMAP.md` | Remediation roadmap |
| `20_OSS_IMPLEMENTATION_DECISIONS.md` | OSS adopt/reject decisions |

### `docs/reconstruction/` — reconstruction analysis
`00_MASTER_AUDIT.md`, `01_MASTER_RECONSTRUCTION_PLAN.md`,
`02_COMPLETE_FEATURE_TRACEABILITY.md`, `03_LIVE_VS_REPOSITORY_RECONCILIATION.md`.

### `docs/USAM_KIDS_PRODUCT_AUDIT_FOR_MASTER_LANDING.md`
A fresh, whole-product audit (pages, features, roles, journeys, nav, design
system, brand assets, AI, API map, data model, analytics, mobile, problems,
JSON) produced most recently. **Start here for a single-file overview.**

### The currently-in-flight execution program — `plans-local/`
This is the *active* plan the mandate says to keep executing:
- `00_MASTER_RECONSTRUCTION_PLAN.md` — approach + phase map, grounded in verified live state.
- `01_PRODUCT_NORTH_STAR.md` — who/what/how/why/when, child- & parent-value audits.
- `63_PRODUCT_GAP_ANALYSIS.md` — **the live gap register (G-1…G-9)**.
- `66_FINAL_ENGINE_INVENTORY.md` — orphan-engine sweep: all 42 modules classified.
- `67_IMPLEMENTATION_SEQUENCE.md` — ordered backlog.
- `47_PRICING_PACKAGING.md`, `48_BUSINESS_MODEL.md` — packaging/pricing spec.
- `STATUS.md` — **live per-slice status with commit hashes** (source of truth for "what's done").

---

## 2. Verified current architecture (measured this session)

| Layer | Reality |
| --- | --- |
| Frontend | React 18 + TS + Vite, Tailwind, React Router 6, TanStack Query, i18next (EN+AR/RTL); **64 pages / 21 feature areas**; static `dist/` via nginx |
| Backend | NestJS 10 + Prisma 5, PostgreSQL + pgvector, Redis/BullMQ; **42 modules / ~55 controllers**; PM2 `usam-backend`; global `/api` prefix, JWT |
| Database | ~90 Prisma models (`backend/prisma/schema.prisma`); raw-SQL migrations applied via psql |
| AI | AWS Bedrock; local embeddings (`@xenova/transformers`); FSRS spaced repetition |
| Voice | `/voice/turn` + Python ASR/TTS sidecars (`services/asr-sidecar`, `services/tts-sidecar`) |
| Deploy | single EC2; `scripts/verify-deployment.sh` gates live bundle-hash + route health |

---

## 3. Feature / Engine Coverage Matrix (reconciled)

Full per-module classification is in `plans-local/66_FINAL_ENGINE_INVENTORY.md`
and `docs/audit/02_ENGINE_MATRIX.md` + `07_ENGINE_CONNECTION_MATRIX.md`. Summary
of the current decision per the mandate's status vocabulary:

| Subsystem | Frontend | Backend | Decision | Evidence |
| --- | --- | --- | --- | --- |
| Auth / onboarding | COMPLETE | COMPLETE | KEEP | `features/auth`, `features/onboarding`, `/api/auth/*` |
| Worlds | COMPLETE | COMPLETE | KEEP | `/worlds`, `worlds` module |
| Missions (story→learn→practice→reward) | COMPLETE | COMPLETE | KEEP | `features/missions`, `missions` module |
| Learner model / age adaptation | COMPLETE | COMPLETE | KEEP | `useAgeAdaptation`, `learner-model` module |
| Curriculum / learning | COMPLETE | COMPLETE | KEEP | `features/learning`, `learning` module, curriculum tables |
| Mastery / adaptive / difficulty | COMPLETE | COMPLETE | KEEP | `/balanced`, `mastery`/`adaptive`/`difficulty-calibration` |
| Assessment / rubrics / questions | PARTIAL→ok | COMPLETE | KEEP | `rubrics`/`questions` modules |
| English (+ coach) | COMPLETE | COMPLETE (coach AI-gated) | KEEP | `features/english`, `english`/`english-coach` |
| Coding sandbox | COMPLETE | COMPLETE | KEEP | Pyodide/Sandpack/Blockly, `coding-sandbox` |
| Coding Coach | **COMPLETE (new, G-9)** | COMPLETE | KEEP | `CodingCoachPanel`, `/coding-coach/*` — **AI runtime unverified (Bedrock)** |
| Characters | COMPLETE | COMPLETE | KEEP | `features/characters`, `characters` module |
| Voice | COMPLETE | COMPLETE | KEEP (gated) | `/voice-chat`, `voice` module — **needs sidecars + Bedrock** |
| Projects / portfolio / credentials | COMPLETE | COMPLETE | KEEP | `/projects`, `/portfolio`, `credentials` |
| Simulations / stories / creativity | COMPLETE | COMPLETE | KEEP | respective features/modules |
| Gamification | COMPLETE | COMPLETE | KEEP | `gamification`, `/shop`, `/leaderboard` |
| Parent + safety/privacy | COMPLETE | COMPLETE | KEEP | `/parents`, `legal` (COPPA/GDPR) |
| Entitlements / plans / pricing | COMPLETE | COMPLETE | KEEP | `/plans`, `entitlements` (4 plans seeded, 3 gates live) |
| Payment gateway | N/A | MOCK_ONLY (manual provider) | NEEDS_REBUILD (7d) | no real processor; needs keys |
| Admin/content/experiments/flags/audit | admin UI | COMPLETE | KEEP (infra/admin) | `/admin/*` |

Status vocabulary used above matches the mandate (COMPLETE / PARTIAL / MOCK_ONLY /
NEEDS_REBUILD / KEEP). No `DUPLICATED` or `DELETE` items were found in the active
learner surface during the orphan sweep (`66_FINAL_ENGINE_INVENTORY.md`).

---

## 4. Current problems (reconciled — full detail in `docs/audit/16` + `18`)

**HIGH**
- AI features (character chat, coaches, voice, AI feedback) are **Bedrock-dependent and unverifiable agent-side** — code present, live behavior unconfirmed. `⛔ blocked`.
- Payment gateway is the **manual/no-charge provider**; `/plans` subscribe activates immediately with no real processor. `NEEDS_REBUILD` (G-4 7d).

**MEDIUM**
- Large JS chunks (vendor ~940 kB, sandpack ~493 kB, codemirror ~465 kB) — no route-split for the coding stack.
- Voice requires external Python sidecars running.
- FREE tier now `aiTutor:false` — existing free users see upgrade prompts (intended monetization; product decision pending).

**LOW**
- Raw-SQL migrations (no Prisma history) — mitigated by `scripts/check-migrations-applied.ts`.
- Full WCAG conformance needs manual AT review (automated axe gate passes).
- Some content engines are structurally complete but content-volume-light per age band (authoring, not code).

---

## 5. Current execution status (source of truth: `plans-local/STATUS.md`)

Shipped + verified live this program (with commits): design system, landing rebuild,
pill nav, Home recommendations + interest chips + companion + World Journey strip,
credentials, worlds map, simulations, privacy/consent, balanced development,
onboarding interests + `PATCH /auth/me/preferences`, interest-weighted
recommendations, **mission reward-loop fix**, **mission Learn step**, evidence
portfolio, **G-4 pricing (4 plans + missions/voice/aiTutor gates + `/plans` + nav
link)**, **accessibility skip-link + axe gate**, orphan-engine sweep, and **G-9
Ask-the-Coach**. Test net: **23 frontend + 53 backend tests**.

**Blocked (need the user, not the agent):**
- AI-tutor / voice / coding-coach *runtime* verification → AWS Bedrock credentials (server-side).
- Real payment gateway (G-4 7d) → processor choice (e.g. Stripe / Paymob) + keys.
- Product decision: keep FREE `aiTutor:false` (monetized) vs. revert to free AI.

**Remaining codeable gaps (not blocked):** G-2c render smoke tests; per-age-band
curriculum content scaffolding (G-6); route-level code-splitting for the coding stack.

---

## 6. How future agents should proceed (anti-duplication protocol)

1. **Read `plans-local/STATUS.md` first** — it is the live "what's done / what's next" with commit hashes.
2. **Read `docs/USAM_KIDS_PRODUCT_AUDIT_FOR_MASTER_LANDING.md`** for a one-file product overview.
3. For any subsystem, **read its `docs/audit/NN_*.md`** before touching it.
4. Pick the next item from `plans-local/63_PRODUCT_GAP_ANALYSIS.md` / `67_IMPLEMENTATION_SEQUENCE.md`.
5. Execute one slice → verify (tsc/eslint/build/tests) → deploy → `verify-deployment.sh` → update `STATUS.md`.
6. **Never** create a parallel audit doc or a second implementation of an existing engine. Extend, don't duplicate.
