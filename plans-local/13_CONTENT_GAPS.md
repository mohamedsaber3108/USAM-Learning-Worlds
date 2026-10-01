# 13 — CONTENT GAPS (what's missing vs the curriculum in 08)

> The MISSING column of the content audit (directive §23). Measured against the
> curriculum map (08) + v1 scale target (08 §5). No fake completeness: breadth is
> partial and expert review is not yet a process.

Date: 2026-09-30

---

## 1. Breadth gaps per domain (vs ~54 missions / ~216 activities per domain v1)

| Domain | Have | Missing to v1 |
|---|---|---|
| English | strands + vocab slice + A1 + A2 breadth | A1/A2 completion across all skill families + B1; speaking/pronunciation/writing/dictation/shadowing content (needs Voice + new activity types) |
| Coding | concepts + slice + A1 breadth + sandbox | A2/B1-equivalent breadth across CT pillars; more real sandbox projects |
| AI Literacy | slice + A1 breadth | breadth across all five AI4K12 big ideas × 3 bands; graph-wiring of `AILiteracyConcept` |
| Entrepreneurship | thin (cross-curricular + simulations) | **a full domain vertical** — it's a locked PRIMARY domain but has no dedicated breadth seed; needs Problem→…→Pitch skills/competencies/missions/projects per band |

## 2. Activity-type gaps (English especially — from 69 §2)

Missing specialized `ActivityType`s + evaluators/renderers:
PRONUNCIATION, DICTATION, SHADOWING, SPEAKING_RESPONSE, CLOZE,
READING_COMPREHENSION, WRITING_RESPONSE, ROLEPLAY. Each = one enum value + one
evaluator case + one renderer (no new persistence). Speaking/pronunciation
additionally gated on Voice (24).

## 3. Process gaps

| Gap | Status |
|---|---|
| Expert pedagogical review step | MISSING — no reviewer workflow; all authored content = NEEDS-EXPERT-REVIEW |
| Default seeder points at 4 domains + 15 chars | MISSING — `seed.ts` still seeds 12 school subjects + Azouz; must REPLACE |
| Cross-curricular concepts wired into graph | PARTIAL — flat lists, not under Domain→Skill→Competency |
| Licensed English listening/reading corpora | MISSING — need open/public-domain sourcing (36 §8) |
| Diagnostic/placement item banks per domain | PARTIAL — question/difficulty infra exists; banks thin |

## 4. Priority order for content work (feeds 44 implementation sequence)

1. REPLACE default seeder → 4 domains + 15 characters + worlds (unblocks correct product shape).
2. Entrepreneurship vertical slice + A1 breadth (it's the thinnest PRIMARY domain).
3. Wire cross-curricular concepts into the graph.
4. English specialized activity types (text-first ones: CLOZE, READING_COMPREHENSION, WRITING_RESPONSE) — before voice-gated ones.
5. Scale breadth per domain/band toward the v1 target; each item carries provenance + review status.
6. Establish the expert-review workflow (even lightweight) before marking any content "final".

## 5. Honesty rule (standing)

Content completeness is reported as counts (missions/activities per domain/band)
with provenance+review status, never as a bare "done". A domain is "v1 complete"
only when it hits the 08 §5 scale AND its content is VALIDATED/reviewed AND the
end-to-end flow (Evidence→Mastery→Review→Recommendation→Portfolio) runs for it.
