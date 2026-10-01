# 39 — DATA ARCHITECTURE

> The Prisma data model (96 models) organized by concern. Source of truth =
> `backend/prisma/schema.prisma`. This is a map, not a redefinition.

Date: 2026-09-30

---

## 1. Identity & access
`User` (Role: LEARNER/GUARDIAN/MODERATOR/ADMIN) · `Learner` (ageBand,
preferences) · `Guardian` · `Guardianship` · `ConsentRecord` · `DataSubjectRequest`.

## 2. Curriculum graph
`Domain → Skill → Competency → {Concept, LearningObjective} → Activity`;
`ConceptPrerequisite`, `CompetencyPrerequisite`, `LearningPath(+Node, +Progress)`;
`EnglishStrand` (CEFR) ↔ `Competency.strandId`; `World` (domain-scoped) → `Mission`.

## 3. Learning events & mastery
`Mission(+MissionActivity, +MissionRun, +MissionReflection)` · `Activity(+Attempt)`
· `MasteryRecord` (MasteryState, confidence) · `Evidence` (8 types) ·
`LearningEvent` (telemetry) · `Flashcard(+FlashcardReview w/ FSRS state)` ·
`CognitiveLoadSignal` · `MisconceptionPattern` · `DifficultyCalibrationFlag`.

## 4. Domain concept tables (wire into graph — 08 §6)
`CodingConcept`, `ComputationalThinkingConcept`, `AILiteracyConcept`,
`EntrepreneurshipConcept`, `FinancialLiteracyConcept`, `CriticalThinkingConcept`,
`ProblemSolvingConcept`, `CommunicationSkillConcept`, `DigitalLiteracyConcept`,
`CareerExplorationConcept`, `CreativityPrompt/Submission`, `VisualLanguageCard`.

## 5. Experience
`Character(+State, +Interaction)`, `Conversation(+Message)`, `LearnerContext` ·
`Story(+StoryPage)` · `SimulationScenario(+DecisionPoint)` · `ReflectionPrompt`
· `MediaAsset`.

## 6. Projects / evidence output
`Project(+Milestone, +Collaborator)` · `Rubric(+Criterion)` · `Credential(+
Definition)`.

## 7. Gamification
`Progression` · `XPGain` · `PracticeStreak` · `StreakFreezePurchase` ·
`AvatarCosmetic` · `LearnerCosmeticUnlock` · `DailyGoal`.

## 8. Commerce
`Plan` (code/priceCents/currency/interval TEXT/features JSON) · `Subscription`
(ownerUserId/planId/status/provider/period). Packaging via `Plan.features` (10).

## 9. Content governance
`ContentItem` (status workflow) · `ContentSource` · `ContentLicense` ·
`ContentQAFlag` · `AssessmentQualityFlag` · `PromptTemplate` · `QuestionTemplate`
· `AIEvalRun(+Result)` · `Translation` (EN/ar/ar-EG, human-approval).

## 10. Platform / safety
`FeatureFlag` · `Experiment(+Assignment)` · `AdminAuditLog` · `Notification` ·
`ModerationLog` · `QuarantinedContent` · `SafetyEscalation` · `SafetyPolicy` ·
`AIUsageLog`.

## 11. Rules
- Enums have had drift fixes (`20260930_fix_enum_drift`); treat schema as truth.
- `interval` is TEXT (not a PG enum) deliberately (schema comment) — don't model
  as Prisma enum.
- Age enum `AGE_8_9/10_11/12_14` ↔ product labels 8-9/10-11/12-14.
