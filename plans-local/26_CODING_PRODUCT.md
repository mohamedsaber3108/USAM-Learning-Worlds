# 26 — CODING PRODUCT

> Coding / Computational Thinking. Maps to ISTE CT pillars + CSTA PK-12 (36 §5).
> Execution = KEEP Pyodide/Sandpack + server re-validation (coding trust loop).

Date: 2026-09-30

---

## 1. Scope / competency map (ISTE CT pillars)

Decomposition · Pattern Recognition · Abstraction · Algorithms — plus
Programming (blocks → script → real code), Debugging-as-method, and Projects.
Backend `CodingConcept` (19 seeded) + `ComputationalThinkingConcept` map to
Concepts. Reference: ISTE/CSTA (REFERENCE ONLY — 36 §5).

## 2. Age-adaptive coding surface (from age-presentation.ts)

- 8–9 Explorer: **visual-blocks** (`codingSurface: visual-blocks`); errors framed
  as "the machine is confused".
- 10–11 Creator: **blocks + script peek** (`blocks-and-script`).
- 12–14 Pathfinder: **real code editor** (`code-editor`); structure/trade-offs.
Codey (coding mentor, 23) asks learners to predict output before running;
hints-before-answers; never pastes a solution.

## 3. Execution (KEEP — already in stack)

Pyodide (Python-in-WASM, client, safe) + Sandpack (JS/web) + backend
`coding-sandbox` module for server re-validation (the "trust loop": client runs,
server re-validates before awarding evidence). ActivityType `CODE`. Threat model:
prior `plans-local/75_CODING_SECURITY_THREAT_MODEL.md` — carry forward + verify.

## 4. Flow on the spine

Coding missions = Missions of CODE/SELECT/EXPLAIN activities under Objectives
under Competencies → submit → `{passed, score, coachFeedback, testsPassed/Total}`
→ Evidence → Mastery → Review → Recommendation → coding Projects → portfolio.
(This is the PROVEN path — Coding is what verified the spine runs end-to-end.)

## 5. Content (12/13)

Have: 19 concepts + vertical slice + A1 breadth + sandbox concept-missions. Need:
A2/B1-equivalent breadth across CT pillars + more real sandbox projects. Target
scale: 08 §5.

## 6. Done definition

Real coding missions across CT pillars per band; sandbox execution + server
re-validation; Evidence→Mastery→Review; projects → portfolio; age-adaptive coding
surface; tested; live-verified. Current: slice + A1 breadth + sandbox COMPLETE;
full-domain pending breadth scale.
