# 25 — ENGLISH PRODUCT

> English must be strong enough to stand alone as a premium language product
> (directive §32). Builds on prior `69_ENGLISH_DOMAIN_RECONSTRUCTION.md` (English
> plugs into the canonical spine) + CEFR young-learner framework (36 §4).

Date: 2026-09-30

---

## 1. Scope (directive §32 checklist → USAM)

Vocabulary · Grammar · Reading · Listening · Speaking · Pronunciation · Phonics ·
Writing · Conversation · Roleplay · Interactive Stories · Shadowing · Dictation ·
Sentence building · Collocations · Idioms · Real-world scenarios · CEFR
progression · Adaptive review (FSRS) · Placement · Mastery · Projects.

## 2. Structure on the spine (from 69, verified)

`Domain English → Skills (strand families) → Competencies (CEFR-banded via
EnglishStrand.strandId) → Objectives → Activities → Missions`. CEFR lives on
`EnglishStrand` (not duplicated on Competency). 15 strands seeded.

Age↔CEFR: 8–9 → pre-A1/A1 (phonics, core vocab, simple sentences); 10–11 → A1/A2
(grammar patterns, reading, short writing); 12–14 → A2/B1 (comprehension,
conversation, writing, real-life English).

## 3. Activity types (shared shell + specialized evaluators — 69 §2)

Now: SELECT/MATCH/EXPLAIN (text vocab/grammar). To add (13): CLOZE,
READING_COMPREHENSION, WRITING_RESPONSE (text-first, no voice) → then
PRONUNCIATION, DICTATION, SHADOWING, SPEAKING_RESPONSE, ROLEPLAY (voice-gated,
24). Each = one `ActivityType` enum value + one evaluator case + one renderer; no
new persistence.

## 4. Speaking/pronunciation (voice — 24)

Backend coach endpoints `pronunciation`/`grammar`/`vocabulary`/`reading` exist;
voice via `POST /voice/turn` + WER scoring. Luma is the English coach (23). EG-
Arabic-aware; captions always on.

## 5. Content (12/13)

Have: strands + vocab slice + A1 + A2 breadth. Need: complete A1/A2 across skill
families + B1; speaking/writing content; licensed/open listening+reading corpora
(36 §8). Content = original + open-licensed + controlled AI generation, each
carrying provenance + review status (12 §4). Target scale per band: 08 §5.

## 6. Done definition (69 §7)

Real missions/activities across the curriculum; flow produces Evidence→Mastery→
Review→Recommendation; surfaced in English UI + Balanced Development + portfolio;
age-adaptive; EN/AR; states; a11y; tested; live-verified. Current: vertical slice
+ A1/A2 breadth COMPLETE; full-domain pending content scale + voice activities.
