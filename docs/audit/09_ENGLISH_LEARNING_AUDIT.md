# 09 — English Learning Audit

**Baseline:** `origin/main @ 3a787c0`. English = `learning/english.controller.ts` (`/english/*`) + `ai/services/english-coach.service.ts` (all AI-prompt driven) + `learning/services/translation.service.ts`. Read-only evidence.

## Sub-skill status

| Sub-skill | Backend | DB/seed | Frontend | Status |
|---|---|---|---|---|
| Vocabulary (USAM-ENG-001) | `POST /english/vocabulary/practice` (AI-gen JSON) | "Vocabulary Building" strand | not wired | **PARTIAL** |
| Grammar (USAM-ENG-002) | `POST /english/grammar/correct` (AI prompt; `countMistakes` keyword heuristic) | "Grammar Fundamentals" | not wired | **PARTIAL** (NOT LanguageTool) |
| Reading (USAM-ENG-003) | `POST /english/reading/passage` (AI-gen) | reading strands | not wired | **PARTIAL** |
| Listening (USAM-ENG-004) | none | strand row only | none | **MISSING** |
| Speaking (USAM-ENG-005) | none (mock only in deprecated `src/`) | strand row | mock only | **MISSING/SIMULATED** |
| Pronunciation (USAM-ENG-006) | `POST /english/pronunciation/feedback` (AI text tips) | strand row | not wired | **PARTIAL/PLACEHOLDER** — score hardcoded `0.85` (`// TODO: Add actual pronunciation scoring when STT is implemented`) |
| Writing (USAM-ENG-007) | none (grammar/correct is nearest) | writing strands | none | **MISSING** |
| Conversation (USAM-ENG-008) | `POST /english/conversation` (real AI, CEFR-aware) | strand row | not wired (deployed page logs + "coming soon") | **PARTIAL** |

## Cross-cutting findings

| ID | Finding | Evidence | Maps to |
|---|---|---|---|
| ENG-1 | **Controller↔service DTO mismatch** — English endpoints never verified end-to-end | controller `{message,context}`/`{targetText,spokenTranscription}` vs service `{userMessage}`/`{word,transcript}` | USAM-ENG-*, API-4 |
| ENG-2 | Pronunciation score is a hardcoded `0.85` placeholder; no audio/phoneme/STT anywhere in backend | `english-coach.service.ts providePronunciationFeedback` | USAM-ENG-006, USAM-VOICE-003 |
| ENG-3 | No `grammar-check.service.ts` / LanguageTool; grammar is a pure LLM prompt with heuristic post-processing | file_search + `correctGrammar` | USAM-ENG-002 |
| ENG-4 | CEFR is a nullable free-text `EnglishStrand.cefrLevel` + age/XP heuristics; no enum, no placement test, no stored per-learner level | schema + `determineCEFRLevel`/`getLearnerCEFRLevel` | USAM-ENG-007 |
| ENG-5 | Egyptian-Arabic scaffolding: storage + language codes (`en/ar/ar-EG`) + RTL exist, but `autoTranslate` writes a `[AR-EG] source` **placeholder marker** (`// TODO: real translation API`); `Translation.isHumanApproved` field exists but no approval **workflow** | `translation.service.ts` | USAM-ENG-008, USAM-LOC-001/003 |
| ENG-6 | **No content provenance/license/attribution** on English content | grep — none | USAM-ENG-009, USAM-CMS-003 |
| ENG-7 | **No ingested English datasets** — all content is AI-generated at request time or 14 static seed strands | grep dataset/corpus — none | USAM-ENG-010 |
| ENG-8 | Deployed frontend (`EnglishLearning.tsx`) wires only `GET /english/strands`; all practice actions are stubs ("coming soon") | page | USAM-ENG-*, USAM-FE-002 |

## Status against registry

USAM-ENG-001/002/003/008: **PARTIAL** (AI wrapper, UI not wired, DTO mismatch). USAM-ENG-004/005/007: **MISSING**. USAM-ENG-006: **PLACEHOLDER**. USAM-ENG-007(CEFR): **PARTIAL**. USAM-ENG-009/010: **MISSING**. USAM-LOC-001: **PARTIAL** (infra present, content empty). USAM-LOC-003: **STUB**.

> Note: this is exactly the "engaging but educationally weak / not production" pattern the spec warns about — English is currently an AI-prompt wrapper, not a real CEFR-aligned, dataset-backed, assessment-driven English engine.


---

## ⚠️ CORRECTION (verified against real `M:\USAM-main` worktree)

The English sub-agent read the **stale workspace copy**. On current `origin/main`:
- `english.controller.ts` is a **lean read-only strands controller** (`GET /english/strands`, `GET /english/strands/:slug`) — the coach methods (conversation/grammar/pronunciation/vocabulary/reading) and the controller↔service DTO mismatch (ENG-1) and `progression.xp` usage are **NOT present** here. ENG-1 is **stale**.
- The `EnglishStrand` model comment states **45 seeded rows across 9 strand types** (Vocabulary, Grammar, Pronunciation, Listening, Reading, Writing, Speaking, Shadowing, Dictation, CEFR A1–B2) — richer than the 14-strand seed the sub-agent found in the old copy.

**Still real:** pronunciation real-scoring is absent (needs STT); `translation.autoTranslate` is a placeholder (USAM-LOC-003); no ingested datasets/provenance (ENG-009/010); Listening/Speaking/Writing lack real interactive backends beyond strand metadata. The English **coach** (conversation/grammar/etc.) now lives in `ai/services/english-coach.service.ts` reachable via the AI module, not the strands controller — re-map its reachability in a follow-up pass. Net: English is **less broken** than first reported, but still not a production CEFR-aligned, dataset-backed engine.
