# 06 — LEARNING METHODOLOGY (research → product rules)

> Per directive §35: cite the actual research, then convert each finding into a
> USAM product rule with engine behavior, UX behavior, and a measurable outcome.
> Format per principle: **Finding → Principle → USAM rule → Engine → UX →
> Measurable outcome.** Content rephrased for licensing compliance.

Date: 2026-09-30

---

## 1. Evidence base (sources)

- Dunlosky et al. / Weinstein, Madan & Sumeracki — six strategies with robust
  support: **spaced practice, interleaving, retrieval practice, elaboration,
  concrete examples, dual coding**. [Teaching the science of learning (PMC5780548)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5780548/).
- Meta-analysis of ten techniques (242 studies, 169k participants): **distributed
  practice and practice testing** are the most effective. [Frontiers in Education](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.581216/full).
- Retrieval practice strengthens memory traces; benefits transfer and inference;
  works in real primary-school settings. [Frontiers in Psychology 2025](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1632206/full).
- Spaced retrieval effectiveness can be boosted by combining with other
  techniques. [PMC11536137](https://pmc.ncbi.nlm.nih.gov/articles/PMC11536137/).
- Computational thinking pillars (Wing 2006, via ISTE/CSTA): decomposition,
  pattern recognition, abstraction, algorithms. [ISTE CT](https://iste.org/computational-thinking),
  [CSTA PK-12 standards](https://csteachers.org/pk12standards/).
- AI literacy (AI4K12): **five big ideas** — Perception, Representation &
  Reasoning, Learning, Natural Interaction, Societal Impact; grade bands K-2/3-5/
  6-8/9-12. [AI4K12 (Touretzky & Gardner-McCune)](https://raw.githubusercontent.com/touretzkyds/ai4k12/master/documents/Touretzky_Gardner-McCune_AI-Thinking_2021.pdf).
  K-12 AI literacy components (systematic review): foundational concepts,
  creating AI artifacts, interacting with AI agents, AI ethics awareness,
  human-AI relationships. [Springer 2025](https://link.springer.com/article/10.1007/s41979-025-00166-z).
- CEFR for young learners: pre-A1 → B1 descriptors tailored to ages 6–14 (Global
  Scale of English Young Learners). [CEFR young-learner mapping (CoE)](https://midiasstoragesec.blob.core.windows.net/001/2018/10/cefr-mapping-descriptors-young-learners-11-15y_may2016-doc1_.pdf),
  [GSE Young Learners inventory](https://www.researchgate.net/publication/279763996).
- Entrepreneurship for kids: design-thinking (empathize→define→ideate→prototype→
  test), mindset over theory, play + real responsibility + reflection. [EdTech design-thinking](https://edtech-class.com/2023/06/09/using-design-thinking-to-teach-entrepreneurship-in-the-classroom/),
  [STEM-based entrepreneurship, primary (ERIC EJ1493905)](http://files.eric.ed.gov/fulltext/EJ1493905.pdf).

## 2. Research → USAM product rules

### R1 — Retrieval practice (practice testing)
Finding: recalling beats re-reading; strongest-evidence technique.
Principle: learning is proven by RETRIEVAL, not exposure.
USAM rule: a competency never advances toward mastery on "viewed"; it advances on
successful **retrieval attempts** logged as `Evidence`.
Engine: mastery service records `Evidence` (type KNOWLEDGE/APPLICATION/...),
not page views. UX: every learn beat is followed by a retrieval beat.
Measurable: % of mastery gain attributable to retrieval events (target: ~100%).

### R2 — Spaced practice (distributed)
Finding: spacing >> massing for retention after a month.
Principle: schedule review over time, don't cram.
USAM rule: due competencies/cards resurface on an expanding schedule.
Engine: FSRS-based scheduler (see 36 OSS) on `MasteryRecord.reviewDue` /
`FlashcardReview`. UX: "review due" surfaced on Home + Practice.
Measurable: 7/30-day retention of mastered competencies.

### R3 — Interleaving
Finding: mixing related topics beats blocking.
Principle: vary practice across competencies/domains.
USAM rule: practice sessions interleave competencies within a skill, not 20 of
the same. Engine: session planner mixes due items + ZPD items across competencies.
UX: a practice session visibly mixes types. Measurable: transfer-task success.

### R4 — Worked examples / explanation before retrieval
Finding: concrete examples + a teaching beat aid acquisition.
Principle: TEACH before you TEST (the "Learn" beat).
USAM rule: every mission has a Discover/Explain beat before Practice (prior North
Star flags the missing Learn beat as a top gap). Engine: session =
REVIEW→DISCOVERY→EXPLAIN→PRACTICE→INTERACT→CREATE→REFLECT (directive §28).
UX: mission stepper shows the teach beat. Measurable: first-attempt success after
the teach beat.

### R5 — Scaffolding + ZPD
Finding: learning happens just beyond current ability with support.
Principle: adaptive difficulty within reach; fade support (ScaffoldLevel
MODELLED→GUIDED→COACHED→INDEPENDENT already in schema).
USAM rule: difficulty chosen from mastery confidence (ZPD engine exists), scaffold
fades as mastery rises. Engine: ZPDCalculator + difficulty-calibration module.
UX: hints before answers; mentor intervenes on repeated struggle.
Measurable: struggle-recovery rate; time-in-ZPD.

### R6 — Formative, immediate, specific feedback
Finding: timely specific feedback drives gains.
Principle: feedback names the gap, not just right/wrong.
USAM rule: every activity submit returns `{correct, score, feedback}`;
characters give specific, in-context correction. Engine: activity evaluator +
character response. UX: feedback shown inline immediately. Measurable: second-
attempt improvement.

### R7 — Metacognition / reflection
Finding: reflection improves transfer.
Principle: learners name what they learned + what's next.
USAM rule: missions end with a reflection beat (`MissionReflection`,
`ReflectionPrompt` exist). Engine: reflection module. UX: short post-mission
reflection. Measurable: reflection completion + its correlation with retention.

### R8 — Project-based learning + transfer
Finding: creating transfers knowledge; entrepreneurship = design-thinking loop.
Principle: build real things; produce evidence.
USAM rule: each domain has projects that output portfolio artifacts +
`Evidence`; entrepreneurship follows Problem→Idea→User→Solution→Create→Test→
Improve→Value→Pitch. Engine: projects + rubrics + evidence. UX: project workspace
with milestones. Measurable: artifacts per learner; rubric-scored quality.

### R9 — Motivation without manipulation
Finding/Principle (ethics, directive §31): rewards must not create dependency,
FOMO, or guilt; AI must not manipulate children.
USAM rule: rewards ≠ mastery; no dark patterns; Azouz never guilt-trips, never
asks for secrecy, never pressures. Engine: gamification decoupled from mastery
state. UX: streaks encourage, never shame; parent can see everything.
Measurable: healthy-return metrics without coercive mechanics (qualitative +
no-FOMO design review).

## 3. The USAM learning loop (canonical)

`REVIEW (due retrieval) → DISCOVERY → EXPLANATION (teach beat) → PRACTICE
(retrieval, interleaved, ZPD) → INTERACTION (character/voice) → CREATION
(project/artifact) → REFLECTION`. The session engine (31) decides which beats
run, how long, and when a mentor/voice enters — adapting to age + mastery +
fatigue (CognitiveLoadSignal exists) + objective.
