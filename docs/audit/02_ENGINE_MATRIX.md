# 02 — Engine Matrix

**Baseline:** `origin/main @ 3a787c0`. One row per engine with the spec's per-feature verification collapsed to the columns that carry signal. Status uses registry vocabulary. Evidence lives in the linked domain-audit files.

Legend for the compact columns: FE=frontend surface, BE=backend service, DB=data model, API=reachable contract, Conn=connected end-to-end, Prod=production quality (not mock/placeholder).

| Engine | Req IDs | FE | BE | DB | API | Conn | Prod | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| Identity & Auth | IDN-001..008 | ✓ | ✓ | ✓ | ✕ | partial | ✕ | IMPLEMENTED_BUT_INCORRECT | register ADMIN escalation (BE-A1); refresh broken (API-3) |
| Learner Profile/State | PROF-001..005 | partial | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | `learner-context.service`; no distinct "learner state" layer |
| Age Adaptation | AGE-001..004 | partial | ✓ | ✓(AgeVariant) | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | age-band instructions in prompts + AgeVariant; UI density partial |
| Knowledge Graph | KG-001..003 | ✕ | ✓ | ✓ | partial | partial | partial | PARTIALLY_IMPLEMENTED | Concept/prereq real; fragmented by 11 domain-concept tables (DB-3) |
| Curriculum/Standards | CUR-001..003 | partial | ✓ | ✓ | ✓ | partial | ✕ | REQUIRES_EDUCATIONAL_VALIDATION | chain modeled; no CEFR/UNESCO validation |
| Adaptive Learning | ADAPT-001..004 | partial | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | ZPD/recommendation/interleaving/transfer services real |
| Mastery | MAS-001..002 | partial | ✓ | ✓ | ✓ | ✓ | partial | PARTIALLY_IMPLEMENTED | MasteryRecord/Evidence + confidence algorithm |
| Assessment | ASSESS-001..004 | partial | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | ActivityType 7 kinds; no oral/pronunciation/adaptive-difficulty depth |
| Spaced Review | REV-001..002 | partial | ✓ | ✓ | ✓ | partial | ✕ | PARTIALLY_IMPLEMENTED | naive fixed-bucket, not FSRS |
| Recommendation | REC-001 | partial | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | orchestrated-next-activity exists |
| Learning Evidence | EVID-001 | ✕ | ✓ | ✓ | partial | partial | partial | PARTIALLY_IMPLEMENTED | Evidence model + recordEvidence; full chain→credential unproven |
| Missions/World | MIS-001, WORLD-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | IMPLEMENTED_BUT_INCOMPLETE | IDOR + no completion outcome (BE-M1/M2/M3) |
| Projects/PBL | PROJ-001..002 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | milestones/rubrics/collaborators/research notes real |
| Challenges | CHAL-001 | partial | partial | partial | partial | partial | partial | PARTIALLY_IMPLEMENTED | difficulty-calibration + bloom filter |
| Gamification | GAM-001..002 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | XPGain FK defect (DB-1); anti-gaming missing |
| English | ENG-001..010 | partial | ✓ | ✓ | ✕ | ✕ | ✕ | PARTIALLY_IMPLEMENTED / gaps | AI-wrapper; DTO mismatch; pronunciation placeholder; listening/speaking/writing MISSING |
| Coding | CODE-001..006 | ✓ | ✓ | ✓ | partial | partial | partial | PARTIALLY_IMPLEMENTED | Pyodide/Sandpack; no Blockly; sandbox security unverified |
| AI Literacy | AIL-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | concepts seeded; NOVA character |
| Science | SCI-001..002 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | simulation module (branching); no real sim framework |
| Creativity | CRT-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | creativity prompts/submissions |
| Thinking Skills | THINK-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | problem/computational/critical-thinking concepts |
| Communication | COMM-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | concept tables + character (Tala) |
| Entrepreneurship | ENT-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | concepts + Adam character |
| Digital Skills | DIG-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | concepts + Byte character |
| Financial Literacy | FIN-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | concepts + Nour character |
| Story | STORY-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | Story/StoryPage branching |
| Portfolio/Credentials | PORT-001..002 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | portfolio real; Open Badges missing |
| Characters | CHAR-001..005 | ✓ | ✓ | ✓ | ✕(prefix) | partial | partial | PARTIALLY_IMPLEMENTED | framework+15 seeded+safety strong; orchestrator MISSING; API-1 |
| Avatar/Animation | AVATAR-001..003 | ✓ | n/a | partial | n/a | partial | partial | PARTIALLY_IMPLEMENTED | 15 SVG faces; no learner avatar builder; no mood states |
| Voice/Speech | VOICE-001..004 | ✓ | ✓ | partial | ✓ | partial | ✕ | PARTIALLY_IMPLEMENTED | turn-based sidecars; no EG-Arabic child benchmark |
| AI Orchestration | AI-001..003 | n/a | ✓ | ✓ | ✓ | partial | ✕ | PARTIALLY_IMPLEMENTED | single provider; model router DEAD; cost partial |
| RAG/Retrieval | RAG-001..002 | n/a | ✓ | partial | ✓ | partial | ✕ | PARTIALLY_IMPLEMENTED | full-text not vector |
| AI Evaluation | AIEVAL-001..003 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | heuristic golden-dataset harness |
| Child Safety | SAFE-001..006 | partial | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | strong on character path; coach paths UNPROTECTED (SAFE-006) |
| Privacy/Legal | PRIV-001..002 | n/a | partial | partial | n/a | partial | ✕ | REQUIRES_LEGAL_REVIEW | consent minimal; retention narrow; no legal matrix |
| Security | SEC-001..003 | partial | ✓ | ✓ | partial | partial | ✕ | REQUIRES_SECURITY_REVIEW | throttle generic; register escalation; no tool-permission system |
| Parent | PARENT-001..002 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | dashboard + time limits; comms-summary layer missing |
| Community | COMMU-001..002 | ✓ | ✓ | ✓ | ✓ | partial | partial | REQUIRES_DECISION | feed/moderation/report; V1 on/off decision needed |
| Accessibility/SEN | A11Y-001..003 | partial | n/a | n/a | n/a | partial | partial | PARTIALLY_IMPLEMENTED | aria/RTL good; no focus-trap; no a11y CI; SEN research |
| Localization | LOC-001..003 | ✓ | ✓ | ✓ | ✓ | partial | ✕ | PARTIALLY_IMPLEMENTED | i18n/RTL real; translation content is placeholder |
| Content/CMS | CMS-001..006 | ✓(admin) | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | lifecycle real; provenance free-text; ContentItem orphaned |
| Search | SEARCH-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | full-text search |
| Notifications | NOTIF-001 | ✓ | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | notification model + triggers |
| Billing/Entitlement | BILL-001..002 | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | MISSING | no models/services at all (DB-5) |
| Analytics/Experiments | ANALYT-001..006 | ✓(admin) | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | LearningEvent + experiments + flags + pino |
| Frontend Platform | FE-001..003 | ✓ | n/a | n/a | n/a | partial | partial | PARTIALLY_IMPLEMENTED | good primitives; Zustand unused; no ErrorBoundary; 0 tests |
| Backend Platform | BE-001 | n/a | ✓ | n/a | n/a | partial | partial | PARTIALLY_IMPLEMENTED | clean modules; raw-error handling; contract bugs |
| Data Model | DB-001..002 | n/a | n/a | ✓ | n/a | partial | partial | PARTIALLY_IMPLEMENTED | strong chain; XPGain FK; migration drift |
| Testing | TEST-001 | ✕ | partial | n/a | n/a | ✕ | ✕ | PARTIALLY_IMPLEMENTED | 4 backend specs; 0 frontend tests |
| Infra/Offline/DR | INFRA-001..008 | ✕ | partial | n/a | n/a | ✕ | ✕ | MISSING/PARTIAL | no PWA/offline; no DR plan; env separation partial |
| School/B2B | SCHOOL-001 | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | MISSING | not modeled |
| Human Ops | OPS-001 | ✓(16 admin pages) | ✓ | ✓ | ✓ | partial | partial | PARTIALLY_IMPLEMENTED | admin console + escalation queue |

## Rollup

- **MISSING engines:** Billing/Entitlement, School/B2B, Offline/PWA, Character Orchestrator, AI Tool-Permission system, AI Model Router (dead code), English Listening/Speaking/Writing.
- **Strong/keep:** learning chain, KG, mastery/evidence, character framework+safety, i18n/RTL, admin/ops, red-team harness, adaptive services.
- **Most engines are PARTIALLY_IMPLEMENTED** — real backend + DB, but incomplete connection, quality, or contract correctness. This matches the spec's warning: broad surface, uneven depth.
