# 08 — CURRICULUM (architecture + the 4-domain map)

> The complete curriculum architecture for the locked 4 domains. Reuses the
> VERIFIED canonical learning spine (schema.prisma) — no new learning engine.
> Merges prior `69_ENGLISH_DOMAIN_RECONSTRUCTION.md` (English plugs into the
> spine) and the Gate-2 research frameworks (ISTE/CSTA, AI4K12, CEFR,
> design-thinking). Every activity maps to a real objective; no orphan content.

Date: 2026-09-30

---

## 1. The canonical learning spine (VERIFIED — reuse, do not duplicate)

```
Domain → World → Mission                         (navigation / world layer)
Domain → Skill → Competency → {Concept, LearningObjective} → Activity   (graph)
Activity → MissionActivity → Mission → MissionRun → ActivityAttempt
        → Evidence → MasteryRecord → (reviewDue / FSRS) → Recommendation
        → Project → Portfolio → Credential
```
Confirmed generic and already runnable end-to-end — Coding uses it today
(coding missions = Missions of Activities under Objectives under Competencies;
submit → `recordEvidence` → `MasteryRecord` → reviewDue). English, AI, and
Entrepreneurship plug into the SAME spine. (Prior proof: 69 §0.)

Mapping rule (directive §22): every Activity → a real LearningObjective; every
Mission → Skills (via its activities' objectives); every Project → Evidence;
every Assessment → MasteryRecord update; every Mastery change → Recommendation.
**No orphan learning content. No meaningless games. No reward disconnected from
learning.**

## 2. The 4 primary domains (replace the 12 school-subject seed)

Seed migration (Gate 5) retires the 12 generic domains (Math/Science/PE/…) and
seeds exactly these as `Domain` rows (others become CONTEXTUAL only — directive
§20), each with Worlds:

### D1 — English (CEFR young-learner spine; merges doc 69)
- Skills = strand families: Vocabulary, Grammar, Phonics/Spelling, Pronunciation,
  Listening, Speaking, Reading, Writing, Comprehension, Conversation, Stories,
  Real-life English. (Backend `EnglishStrand` = (family × CEFR) metadata mapped
  onto `Competency.strandId`; CEFR lives on the strand — do NOT duplicate on
  Competency, per 69 §1.)
- Competencies CEFR-banded. Age↔CEFR anchor: 8–9 → pre-A1/A1; 10–11 → A1/A2;
  12–14 → A2/B1.
- Specialized activity types (PRONUNCIATION/DICTATION/SHADOWING/SPEAKING_RESPONSE
  /CLOZE/READING_COMPREHENSION/WRITING_RESPONSE/ROLEPLAY) extend the shared
  `Activity.content` JSON + evaluator switch (69 §2); speaking needs Voice (24).

### D2 — Coding / Computational Thinking (ISTE/CSTA reference)
- Skills along CT pillars: Decomposition, Pattern Recognition, Abstraction,
  Algorithms + Programming (blocks→script→real code) + Debugging + Projects.
- Backend `CodingConcept` (18 seeded) maps to Concepts; `ComputationalThinkingConcept`
  table supports CT framing. Execution: Pyodide/Sandpack (KEEP) + server
  re-validation (coding trust loop). ActivityType `CODE` + coding-sandbox module.

### D3 — AI Literacy & Creation (AI4K12 five big ideas)
- Skills = the five big ideas: Perception, Representation & Reasoning, Learning,
  Natural Interaction, Societal Impact — plus Creating-with-AI and
  Judging-AI-output. Backend `AILiteracyConcept` maps to Concepts (currently a
  flat list — WIRE into the graph in G5). Teach AI, don't just use it (§15).

### D4 — Entrepreneurship / Young Business Building (design thinking)
- Skills along the loop: Problem-finding, Idea/Ideation, User/Empathy, Solution/
  Prototype, Create/Build, Test, Improve/Iterate, Value & Money-basics, Pitch/
  Communicate. Backend `EntrepreneurshipConcept` + `FinancialLiteracyConcept`
  map to Concepts. Older learners extend: customer discovery, business models,
  pricing, budgeting, branding, marketing, negotiation, simulations
  (`SimulationScenario` exists). No corporate theory; mindset + real making.

## 3. Supporting competencies (cross-domain, not separate domains)

Creativity & Design, Critical Thinking, Problem Solving, Communication,
Collaboration, Digital Literacy, Digital Safety, Financial/Life Skills, Research,
Media Literacy, Project Skills, Future Skills. Backend has concept tables for
most (CriticalThinking/ProblemSolving/Communication/Creativity/DigitalLiteracy/
Research/Career). These attach to missions/projects as secondary objectives +
`Evidence` types; surfaced via a "Balanced Development" view (not as primary
domains). Science/Math/etc. appear ONLY contextually here.

## 4. Assessment → Mastery → Evidence → Recommendation (research-aligned)

- Advancement is **evidence/retrieval-driven** (06 R1), never "viewed".
- `MasteryState` 7-step (NOT_STARTED→MASTERED); confidence model keeps deciding
  state; **FSRS (`ts-fsrs`) decides review timing** (36 §1).
- `Evidence` (8 types) from practice/voice/writing/coding/projects/reflection →
  feeds mastery + portfolio + credentials.
- Diagnostic/placement sets starting confidence per domain (07 §4).

## 5. Content scale targets (per 69 §5, applied to all 4 domains)

Launch minimum per domain per age band (anchored to ~10–15 min sessions,
~3/week, spaced review): ~3 skills × ~3 competencies × ~2 objectives × ~4
activities ≈ **~72 activities/band**, ~18 missions/band. Across 3 bands ≈ ~54
missions / ~216 activities per domain for a coherent sellable v1. The vertical
slice (1 competency/1 mission/3 activities) is the proven unit the seed repeats.
Content authoring is ongoing; the architecture makes it data entry against a
working engine. Honest content status tracked in 12/13.

## 6. What changes vs today (routing to Gate 5)

- Retire 12 school-subject domains; seed the 4 (migration, idempotent upsert).
- Wire cross-curricular concept tables (AI/Entrepreneurship/etc.) INTO the
  Domain→Skill→Competency graph (currently flat lists).
- Seed Worlds per domain with unlock conditions.
- Repeat the proven vertical-slice seed pattern to reach v1 scale per domain/band.
