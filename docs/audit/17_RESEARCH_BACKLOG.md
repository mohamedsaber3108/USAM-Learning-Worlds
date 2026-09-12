# 17 — Research Backlog

Items that require **research, design, decision, legal, or educational validation** before implementation. These are recorded honestly and **not** given fabricated conclusions. Each will be resolved in a dedicated research phase, not guessed.

## Mandatory research tracks (from `criticle points.md`)

| ID | Track | Question to answer | Blocking? |
|---|---|---|---|
| R-1 | Child-AI safety + privacy | Dependency/attachment controls; conversation logging bounds; UNESCO/ITU child-AI guidance application | P0 for AI features |
| R-2 | Adaptive learning + mastery model | Choose BKT/DKT/IRT/KST/FSRS/hybrid — scientifically, not "LLM decides" | P1 |
| R-3 | English architecture + datasets | CEFR-aligned progression; licensed pronunciation/reading/listening datasets; per-dataset license audit | P1 |
| R-4 | Age-specific educational UX | Evidence-based 8–9/10–11/12–14 UX, content depth, AI behavior, autonomy | P1 |
| R-5 | Egyptian Arabic + voice | EG-Arabic STT/TTS + child-speech benchmark (8/10/14yo, code-switching, noise) | P1 (voice-blocking) |
| R-6 | Competitor/product UX benchmark | Study Khan Kids/Duolingo/Scratch/Code.org/Brilliant/Prodigy patterns; extract, don't copy | before major UX |

## Legal / compliance (needs counsel)

| ID | Item | Output |
|---|---|---|
| R-7 | Jurisdiction matrix (COPPA, GDPR-K, UK Children's Code, EU AI Act, Egypt, Saudi) | APPLIES/MAY/DOES-NOT/NEEDS-LAWYER per requirement (USAM-PRIV-001) |
| R-8 | Consent + account-lifecycle design | structured consent, retention, deletion, portability (USAM-IDN-009/011, PRIV-002) |
| R-9 | Content licensing/provenance policy | ContentSource/ContentLicense registry design (USAM-CMS-001, ENG-009) |

## Educational validation

| ID | Item | Output |
|---|---|---|
| R-10 | "Does it actually teach?" audit per experience (USAM-TRUTH-001) | learn→teach→practice→check→remediate→transfer→mastery→evidence→next per feature |
| R-11 | Assessment science (USAM-ASSESS-003) | diagnostic/formative/summative + confidence calibration design |
| R-12 | Gamification anti-manipulation (USAM-GAM-002) | Children's-Code-aware review of streaks/nudges/comparison |
| R-13 | Curriculum standards mapping (USAM-CUR-001) | CEFR + UNESCO AI competency + computational-thinking progressions |

## Technical decisions / POCs (from `repos.md`, see `14_OSS`)

| ID | Item | Decision needed |
|---|---|---|
| R-14 | Vector DB: pgvector vs Qdrant (USAM-RAG-002) | POC; pgvector-first recommended |
| R-15 | Realtime voice: LiveKit vs Pipecat (USAM-VOICE-004) | benchmark POC |
| R-16 | FSRS port for spaced review (USAM-REV-002) | adopt+customize |
| R-17 | Blockly integration for visual coding (USAM-CODE-002/006) | adopt plan |
| R-18 | Analytics/observability stack incl. Sentry FSL vs OTel (USAM-ANALYT-006) | license-aware decision |
| R-19 | Guardrails: NeMo/LlamaFirewall as injection layer atop custom moderation (USAM-SAFE-006) | POC, keep custom child policy |
| R-20 | Code sandbox security model (USAM-CODE-005) | isolation/resource-limit design + review |
| R-21 | Community V1 on/off (USAM-COMMU-002) | product decision + moderation design if on |
| R-22 | Concept-table unification vs bespoke (DB-3) | data-model design decision |
| R-23 | Billing/entitlement architecture + provider (USAM-BILL-001) | design + provider abstraction |
| R-24 | Standards adoption: xAPI/Caliper/Open Badges/LTI/OneRoster (USAM-OSS-002) | which to align to for V1 |

## Verification gaps to close (cheap, do in next audit pass)

| ID | Item |
|---|---|
| R-25 | Confirm the master seed runner invokes `seed-character-universe.ts` and a live DB has all 15 characters |
| R-26 | Confirm live PR status of `refs/pull/1,2` (GitHub CLI/API) |
| R-27 | Run `nest build` + `npm run build`/lint on current `origin/main` to confirm the `progression.xp`/DTO compile errors empirically (source-inferred so far) |
| R-28 | Confirm whether the AI-memory purge job actually runs on a schedule |
