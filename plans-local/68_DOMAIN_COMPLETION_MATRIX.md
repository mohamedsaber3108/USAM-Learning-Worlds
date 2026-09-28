# 68 — Domain Completion Matrix (Phase E)

> Tightened Phase-E definition: a domain is COMPLETE only when the full learner
> flow is verified end-to-end — not when its landing/browse page looks good.
> This matrix tracks each domain against the 15 completion criteria and records
> the BLUNT truth about what is wired vs. catalog-only vs. missing.
>
> Evidence: context-gatherer trace 2026-09-28 (English), plus prior audits.
> Legend: ✅ real+wired · 🟡 partial/entry-only · ⛔ blocked (needs owner/creds) ·
> ❌ missing (no backend capability) · N/A.

Last updated: 2026-09-28 · HEAD `312be65`

---

## The 15 completion criteria (per domain)
1 Entry surface · 2 Learning flow · 3 Practice · 4 Assessment · 5 Mastery ·
6 Recommendation · 7 Evidence · 8 Character integration · 9 Voice (where relevant) ·
10 Parent/progress visibility · 11 Responsive · 12 RTL/i18n · 13 Accessibility ·
14 Tests · 15 Deployment verification.

---

## ENGLISH — status: 🟡 ENTRY-ONLY. **Not domain-complete. Backend capability gap.**
Verified by full code trace (context-gatherer, files cited in commit history).

| # | Criterion | State | Evidence |
| --- | --- | --- | --- |
| 1 | Entry surface | ✅ | `EnglishStrandsPage` reworked (E1, deployed 312bcf2): 9 strand families, CEFR filter, i18n, states, RTL |
| 2 | Learning flow | ❌ | Strand cards are **non-interactive display divs** — no navigation, no strand detail route. `getStrand()` is orphaned client code. |
| 3 | Practice | ❌ | **No runnable English activity exists** (frontend or backend). No listening/speaking/pronunciation/writing/dictation/shadowing exercise anywhere. |
| 4 | Assessment | ❌ | None. |
| 5 | Mastery | ❌ | Coach never calls `recordEvidence`; no English mastery persisted. |
| 6 | Recommendation | ❌ | No English-specific recommendation. |
| 7 | Evidence | ❌ | None emitted. |
| 8 | Character | 🟡 | Luma/coach present in UI; not tied to a learning loop. |
| 9 | Voice | ⛔ | `/voice-chat` exists but not English-strand-tied; pronunciation endpoint is a **placeholder score**; STT real scoring unbuilt + Bedrock-gated. |
| 10 | Parent/progress | ❌ | No English progress surfaced. |
| 11 | Responsive | ✅ | E1 |
| 12 | RTL/i18n | ✅ | E1 (EN+AR) |
| 13 | Accessibility | ✅ | E1 (axe pattern, aria-pressed) |
| 14 | Tests | 🟡 | Entry page covered indirectly; no flow tests (no flow to test) |
| 15 | Deploy verified | ✅ (entry only) | 312bcf2 live |
| — | **Coach** (conversation/grammar/vocab/reading) | ⛔ | Real wired chat UI, **Bedrock-gated runtime**. AI-generation, not graded practice. Pronunciation mode missing from UI. |

**Root gap:** `EnglishStrand` is a **catalog island** — no relation to Domain/
Mission/Activity/Mastery; no attached content. A complete English domain needs
BACKEND work (attach activities to strands OR route strands through the Mission
engine; add assessment→evidence→CEFR persistence; STT for speaking). This is an
**owner architecture decision + backend build**, not a frontend rework. ⛔ BLOCKED
on that decision.

---

## CODING — status: 🟡 ENTRY + SANDBOX exist; flow partially real via Missions
| # | Criterion | State | Evidence |
| --- | --- | --- | --- |
| 1 | Entry | ✅ | `CodingPage` /coding (E2, pushed 312be65): real CodingConcept progression |
| 2 | Learning flow | 🟡 | Concept catalog → mission entry. Concepts are catalog (like English) but coding **does** have a runnable path via Missions (below). |
| 3 | Practice | ✅ | Coding runs through the **Mission player** (`CodeMissionRunner`: Pyodide/Sandpack/Blockly) — real in-browser execution + grading (`/coding-sandbox/submissions`). |
| 4 | Assessment | ✅ | Mission activity evaluation + coding-sandbox grading. |
| 5 | Mastery | ✅ | Mission submit → `recordEvidence` (via missions.service). |
| 6 | Recommendation | 🟡 | Generic adaptive recommendations include missions. |
| 7 | Evidence | ✅ | Via mission mastery + credentials. |
| 8 | Character | ✅ | Codey coach panel in the mission runner (`CodingCoachPanel`, ⛔ AI runtime Bedrock). |
| 9 | Voice | N/A | not core to coding |
| 10 | Parent/progress | 🟡 | Via generic mastery/portfolio, not coding-specific |
| 11–13 | Responsive/RTL/a11y | ✅ | E2 |
| 14 | Tests | ✅ | CodingPage (3) + teaching/mission tests |
| 15 | Deploy verified | 🟡 | /coding pushed, awaiting deploy |

**Gap:** the /coding concept catalog isn't linked to specific coding missions
(same catalog-island issue as English, but coding is rescued by the generic
Mission engine already running real coding activities). Verifying the
concept→mission link is the remaining coding work.

---

## AI LEARNING · PRACTICE · CREATIVITY/CRITICAL THINKING · STORIES · SIMULATIONS
To be traced before building (same method as English — do NOT assume).
Preliminary from prior audits:
- **AI Learning**: `AILiteracyConcept` catalog (via cross-curricular) — likely entry-only like English. ⛔ flow likely missing.
- **Practice**: flashcards (FSRS) is real + runnable (`/learn/flashcards`). ✅ likely closest to complete.
- **Creativity/Thinking**: concept catalogs (creativity, thinking-skills, cross-curricular) — entry-heavy.
- **Stories**: `stories` engine has story/page content — may be genuinely runnable (read flow). To verify.
- **Simulations**: `/simulations` browse + player already shipped, real branching scenarios. ✅ likely closest to complete.

---

## Honest program conclusion
The tightened definition exposes that **most "domains" are currently catalog +
(Bedrock-gated) AI chat, not complete learn→practice→assess→master→evidence
flows.** The two domains with a genuinely runnable, evidence-producing flow are:
- **Missions/Coding** (Mission engine: real activities, grading, mastery, evidence).
- **Simulations** and **Practice/Flashcards** (runnable, though evidence tie-in varies).

Building the missing flows for English/AI-literacy/etc. is **backend
architecture work** (attach content to catalogs, wire assessment→evidence), much
of it also **Bedrock-gated** for the AI/voice parts. This requires owner
decisions (see below), not more frontend reworks.
