# 04 — RESEARCH (index + synthesis)

> The research backbone for the reconstruction. Detailed treatments live in:
> 05 (competitors), 06 (learning methodology, cited), 07 (age/adaptation), 36
> (open-source). This doc synthesizes the cross-cutting conclusions that drive
> product decisions in Gate 3+. All external claims carry source links in the
> referenced docs; content rephrased for licensing compliance.

Date: 2026-09-30

---

## 1. What the research settles (decisions, not just notes)

1. **Mastery must be evidence-driven, not exposure-driven** (06 R1). → Curriculum
   (08) advances competencies only on logged retrieval `Evidence`.
2. **Review scheduling = FSRS** (06 R2, 36 §1). → Adopt `ts-fsrs` for the
   when-to-review decision; keep the confidence model for the mastery-state
   decision.
3. **Sessions interleave + teach-before-test** (06 R3/R4). → The session engine
   (31) implements the canonical loop REVIEW→DISCOVERY→EXPLAIN→PRACTICE→INTERACT
   →CREATE→REFLECT, with the Learn/teach beat closing the prior "no teach beat" gap.
4. **Adaptation is multi-factor** (07). → Session planner reads age + ability +
   mastery + interests + history + objective + cognitive load (all stored today;
   not all consumed yet — the wiring is the work).
5. **Coding progression + execution is a solved pattern** (36 §2/§5). → Reuse
   blocks→script→real-code (Scratch/code.org pattern) + Pyodide/Sandpack already
   in the stack; map competencies to ISTE/CSTA.
6. **AI domain = AI4K12 five big ideas** (36 §6). → Perception, Representation &
   Reasoning, Learning, Natural Interaction, Societal Impact; teach AI, don't just
   use it (directive §15).
7. **English = CEFR young-learner descriptors (pre-A1→B1)** (36 §4). → Skeleton
   for English objectives; content = original + open + controlled AI generation.
8. **Entrepreneurship = design thinking, mindset over theory** (36 §7). →
   Problem→Idea→User→Solution→Create→Test→Improve→Value→Pitch; play + real
   responsibility + reflection, age-scaled.
9. **AI tutoring + parent oversight are now table stakes** (05 §4). → Azouz/
   mentors are Socratic (hints before answers) and fully parent-inspectable.
10. **Pricing: multi-domain premium but family-affordable** (05 §1). → FAMILY ≈
    $130/yr positioning (prior 47 doc) sits correctly between Duolingo Super
    family and Max family; validate per market with PPP at billing.

## 2. Differentiation thesis (from 05 §3)

USAM wins on: ONE coherent 4-domain world with ONE orchestrating companion
(Azouz); parent-trustworthy EVIDENCE (mastery + portfolio + credentials);
AI-native but safe-by-design; Arabic-first + EG-Arabic voice; Entrepreneurship as
a real pillar. Everything else (streaks, free tier, AI tutor, family plan) is
table stakes USAM must simply meet well.

## 3. Research → where it lands in later gates

| Research conclusion | Lands in |
|---|---|
| Evidence-driven mastery | 08 Curriculum, 30 Assessment/Mastery/Evidence |
| FSRS scheduling | 31 Adaptive, 36 OSS, backend wiring (G5) |
| Session loop + teach beat | 31 Adaptive/Session engine, 15 Child journey |
| Multi-factor adaptation | 07, 31 |
| Coding/AI/English/Entrepreneurship frameworks | 25/26/27/28 domain products, 08 |
| Safe Socratic AI + parent oversight | 23 Characters, 24 Voice, 34 Parent, 35 Safety |
| Pricing/packaging | 10 Packages, 11 Pricing |

## 4. Open research (carry forward)

- EG-Arabic child-speech voice provider bake-off (36 §3) — gating metric for voice.
- Open Badges standard for credentials (36 §8).
- Openly-licensed English listening/reading corpora (36 §8).
