# 70 — Domain Plugin Architecture

> The rule that prevents dozens of disconnected engines (§3, §13, §14). One
> shared learning spine (USAM CORE); each domain is a PLUGIN that adds only
> specialized renderers/evaluators/tools/content — never a parallel spine.

Last updated: 2026-09-28

---

## USAM CORE (shared spine — reuse everywhere, verified in schema.prisma)
Learner Model · Curriculum (Domain→Skill→Competency→Concept→LearningObjective) ·
Knowledge Graph (CompetencyPrerequisite / ConceptPrerequisite) · **Mission** ·
**Activity** (+ MissionActivity join) · **Assessment** (AssessmentPurpose on
Activity) · **Evidence** · **Mastery** (MasteryRecord + confidence algorithm) ·
**Review** (reviewDue / FSRS flashcards) · **Recommendation** (adaptive) ·
**Project** · **Portfolio** · Credentials.

**Invariant:** attempts, evidence, assessment, mastery, progression, review,
recommendation, portfolio are OWNED BY CORE. A domain must never duplicate them.

## DOMAIN PLUGINS (specialization only)
A plugin = (a) curriculum content mapped onto the spine (Domain/Skill/
Competency/Objective/Activity/Mission rows) + (b) optional taxonomy metadata +
(c) optional specialized `ActivityType` + evaluator + renderer + tools.

| Domain | Taxonomy metadata | Specialized activity types / tools (add only where needed) |
| --- | --- | --- |
| **English** | `EnglishStrand` → tagged on `Competency` (`strandId`,`cefrLevel`) | PRONUNCIATION, DICTATION, SHADOWING, SPEAKING_RESPONSE, CLOZE, READING_COMPREHENSION, WRITING_RESPONSE, ROLEPLAY (+ voice tools) — deferred, contracts defined |
| **Coding** | `CodingConcept` | CODE (exists) via Pyodide/Sandpack/Blockly runners + coding-sandbox grading (exists) |
| **AI Literacy** | `AILiteracyConcept` | prompting / hallucination-eval / bias-privacy-safety scenario activities |
| **Creativity** | `CreativityPrompt` | canvas / storytelling / prototype activities |
| **Critical Thinking / Problem Solving** | `CriticalThinkingConcept` / `ProblemSolvingConcept` | reasoning / decision activities |
| **Communication / Entrepreneurship / Digital / Financial** | respective concept tables | simulation / roleplay / project activities |

Each plugin's specialized activity type is: **1 enum value + 1 `ActivityEvaluator`
case + 1 renderer branch** — sharing the same `Activity.content` JSON + attempt +
evidence + mastery. No new persistence per type.

## EXPERIENCE LAYERS (cross-cutting, not domains)
Characters · Voice · Worlds · Stories · Gamification. These decorate/deliver the
core flow; they don't own learning state.

## GUARDRAILS
Safety · Parent · Privacy/Consent · Authorization/Entitlements · Moderation ·
AI safety. Enforced around core, shared by all plugins.

## How a domain plugs in (checklist)
1. Content mapped onto Domain→Skill→Competency→Objective→Activity→Mission.
2. Taxonomy metadata (if any) tagged on Competency, not a parallel tree.
3. Specialized ActivityType(s) only where a generic one can't express it.
4. Reuse ActivityAttempt → Evidence → MasteryRecord → reviewDue → Recommendation.
5. UI: domain entry surface (explore + coach + missions) launching real missions.
6. Surface progress via /balanced + portfolio (shared), not a domain-only tracker.

This document is the guard against architectural sprawl: if a proposed domain
change would duplicate any CORE-owned capability, it is wrong — map to the spine
instead.
