# USAM Kids — Learning Science References

> Reference Bible §6. Every learning mechanic in USAM must have an educational
> reason. This maps each mechanic to its research basis and to where it lives in
> the product. Institutional sources (UNESCO/UNICEF/OECD/Cambridge/Oxford) are
> named only where they genuinely inform the decision — not as decoration.

Date: 2026-09-23

---

## Mechanic → research basis → USAM implementation

| Mechanic | Research basis | Why it helps children | USAM implementation |
| --- | --- | --- | --- |
| **Mastery learning** | Bloom; competency-based progression | Advance when ready, not on a clock; closes gaps before they compound | `mastery` engine, mastery-by-domain, gated progression |
| **Worked examples before practice** | Worked-example effect (cognitive load theory, Sweller) | Novices learn more from studying a solution than from unguided problem-solving | **Learn step** in mission player (shipped) |
| **Retrieval practice** | Testing effect (Roediger & Karpicke) | Recalling strengthens memory more than re-reading | Practice activities; mission submit loop |
| **Spaced practice** | Spacing effect (Ebbinghaus → modern) | Distributed review beats cramming for retention | **FSRS** flashcards + `mastery.reviewDue` |
| **Interleaving** | Interleaving research (Rohrer) | Mixing problem types improves discrimination + transfer | Recommendation mixes competencies |
| **Scaffolding + ZPD** | Vygotsky (Zone of Proximal Development); Wood/Bruner scaffolding | Support just beyond current ability, faded over time | Adaptive difficulty + `interventions` on struggle; age-band autonomy |
| **Cognitive load management** | Cognitive Load Theory (Sweller) | Don't overload working memory — chunk, reduce extraneous load | Age-band text density/activity length; `cognitive-load` signal engine |
| **Formative assessment + timely feedback** | Black & Wiliam; feedback research (Hattie) | Immediate, specific feedback drives learning | Per-activity evaluation + companion feedback |
| **Metacognition** | Flavell; self-regulated learning | Reflecting on one's learning improves it | **Reflection quick-check** post-mission (shipped) |
| **Project-based learning + transfer** | PBL research; transfer literature | Applying skills to real projects deepens + transfers learning | Projects + portfolio/evidence |
| **Self-directed learning + age-appropriate autonomy** | Self-regulation; developmental psychology | Autonomy scaled to age builds agency safely | Age bands 7–9 (scaffolded) → 13–15 (self-directed) |
| **Motivation (intrinsic-leaning)** | Self-Determination Theory (Deci & Ryan: autonomy/competence/relatedness) | Competence + autonomy + relatedness sustain engagement without manipulation | XP/streaks that encourage (never guilt); characters (relatedness); meaningful choice |
| **Diagnostic placement** | Adaptive assessment; IRT/CAT concepts | Start each learner where they actually are | Onboarding diagnostic → learner model (age + interests today; deepen to skill diagnostic) |

## Institutional references (used, not decorative)
- **UNESCO AI & Education / AI competency frameworks** — inform the *AI-literacy domain* scope (what children should understand about AI: capabilities, limits, bias, ethics). → Coding/AI engines + `docs/product` AI domain.
- **OECD / UNICEF child-digital-wellbeing** — inform the *no-manipulation* stance (screen-time, motivation ethics) and the parent/safety layer.
- **Cambridge/Oxford education research** — referenced only where a specific finding is applied; not claimed as endorsement.

## Reliability rule for adaptivity (Bible §7)
USAM must **not** let an LLM alone decide mastery. The chosen model is a **hybrid**:
`Evidence (activity attempts) + Mastery rules (confidence algorithm) + Knowledge
graph (competency prerequisites) + Spaced review (FSRS) + Adaptive recommendation
+ AI explanation (Bedrock, explanation only)`. Mastery state is computed
deterministically from evidence; AI explains and generates, it does not grade
mastery. This is what makes the progression trustworthy for children and defensible
to parents.

## Open research items (→ `docs/audit/17_RESEARCH_BACKLOG.md`)
- Skill-diagnostic depth at onboarding (beyond age/interests) using IRT/CAT concepts.
- Knowledge-tracing model choice (BKT vs DKT) if/when evidence volume justifies it.
- Age-appropriate AI-literacy curriculum leveling (compare Code.org AI, Elements of AI).
