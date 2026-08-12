# Phase 4: Learning & Content Engine Foundation - Audit & Implementation

**Date:** 2026-08-13  
**Status:** IN PROGRESS  
**Phase Objective:** Build foundation for complete USAM learning engine supporting ages 8-14

---

## SECTION A: CURRENT IMPLEMENTATION AUDIT

### What EXISTS and is GOOD ✅

**1. Learning Model (Solid Foundation)**
- ✅ Domain → Skill → Competency → LearningObjective → Activity hierarchy
- ✅ 7 Activity types: SELECT, MATCH, SEQUENCE, CODE, EXPLAIN, CREATE, SOLVE
- ✅ DifficultyLevel enum: EASY, MEDIUM, HARD, CHALLENGE
- ✅ AgeBand enum: AGE_8_9, AGE_10_11, AGE_12_14
- ✅ Activity evaluator with partial credit scoring
- ✅ Activity content stored as structured JSON

**2. Mastery System (Production-Grade)**
- ✅ FSRS-inspired confidence algorithm
- ✅ 7 MasteryStates: NOT_STARTED → MASTERED
- ✅ 8 EvidenceTypes: KNOWLEDGE, APPLICATION, CREATION, etc.
- ✅ Evidence-based mastery (not completion-based)
- ✅ Weighted success rate (recency bias)
- ✅ Evidence diversity scoring
- ✅ Spacing effect detection
- ✅ Forgetting curve with 7-day stability
- ✅ Spaced review scheduling
- ✅ Async recalculation via Bull queue

**3. Adaptive Learning (ZPD-Based)**
- ✅ ZPD calculator service
- ✅ Difficulty recommendation per competency
- ✅ Growth velocity tracking
- ✅ 4 recommendation types: REVIEW, MISSION, ACTIVITY, CHALLENGE
- ✅ Personalized recommendations
- ✅ Learning path suggestion per skill

**4. Content Infrastructure**
- ✅ Activity content as JSON (flexible structure)
- ✅ Seed data: 8 skills, 11 competencies, 11 objectives, 25 activities, 8 missions
- ✅ Content moderation system (AI-powered, auto-quarantine)

**5. Project System (Basic CRUD)**
- ✅ Project model with states: DRAFT → SHOWCASED
- ✅ Visibility: PRIVATE, GUARDIANS_ONLY, PUBLIC
- ✅ Portfolio view

**6. Safety & Moderation**
- ✅ Content moderation service
- ✅ Quarantine workflow
- ✅ K-12 safety checks

---

### What is PARTIALLY IMPLEMENTED ⚠️

**1. Mission-Activity Linkage (BROKEN)**
- **Issue:** `missions.service.ts` fetches ALL activities globally (`take: 10`)
- **Should:** Activities linked to specific missions
- **Fix Required:** Create MissionActivity junction table

**2. Age Adaptation (SCHEMA ONLY)**
- **Issue:** AgeBand exists but no age-aware content delivery
- **Should:** Content variants, language complexity, scaffolding per age
- **Fix Required:** AgeVariant model + adaptation service

**3. Learning Graph (FLAT)**
- **Issue:** No prerequisite relationships
- **Should:** Skill/Concept prerequisites, dependency checking
- **Fix Required:** Prerequisite model + graph queries

**4. Content Generation (4 AI TASKS ONLY)**
- **Issue:** Only feedback, hint, explain, analyze
- **Should:** Full content generation with educational constraints
- **Fix Required:** Content generation service with validation

**5. Assessment (ACTIVITY-BASED ONLY)**
- **Issue:** Assessment = activity attempts
- **Should:** Dedicated assessments, diagnostic, formative, summative
- **Fix Required:** Assessment model + service

**6. Projects (NO MILESTONES/RUBRICS)**
- **Issue:** Basic CRUD only
- **Should:** Milestones, rubrics, reflection, portfolio evidence
- **Fix Required:** ProjectMilestone, Rubric models

---

### What is MISSING ❌

**Critical Missing (This Phase)**

**1. Concept/Subskill Layer**
- Atomic learning units between Competency and Objective
- **Required:** Concept model

**2. Learning Paths**
- Ordered sequences through curriculum
- **Required:** LearningPath + LearningPathNode models

**3. Domain-Specific Engines**
- English (14 strands, CEFR, conversation)
- Coding (progression, concepts, sandbox prep)
- AI Literacy (age-appropriate AI education)
- Entrepreneurship (business simulation)
- Financial Literacy (money concepts)
- **Required:** Domain-specific services + content structures

**4. Content Validation Pipeline**
- Age check, objective alignment, difficulty calibration
- **Required:** ContentValidationService

**5. Multilingual Support**
- Arabic, Egyptian Arabic, English
- **Required:** Translation model + service

**6. Learning Events**
- Structured telemetry for adaptation
- **Required:** LearningEvent model + service

**7. Diagnostic Assessment**
- Entry-point assessment
- **Required:** DiagnosticAssessment flow

---

## SECTION B: ARCHITECTURE DECISIONS

### Decision 1: Preserve Existing Learning Model ✅
- **Keep:** Domain → Skill → Competency → Objective → Activity
- **Add:** Concept layer between Competency and Objective
- **Add:** Prerequisite relationships
- **Rationale:** Existing model is sound, additive changes only

### Decision 2: Learning Graph via PostgreSQL ✅
- **Approach:** Self-referential prerequisites + recursive CTEs
- **Not:** Separate graph database (Neo4j)
- **Rationale:** Current scale doesn't justify separate DB

### Decision 3: Concepts as Atomic Units ✅
- **Model:** Concept sits between Competency and LearningObjective
- **Example:** Competency "Programming Logic" → Concepts: "variables", "conditionals", "loops"
- **Rationale:** More granular than competency, prerequisites at concept level

### Decision 4: Age Adaptation via Variants ✅
- **Model:** AgeVariant table with entityType/entityId/ageBand
- **Content:** Activity content can have age-specific overrides
- **Rationale:** Flexible, non-breaking, works with existing activities

### Decision 5: Domain Engines as Services ✅
- **Approach:** Domain-specific services (EnglishService, CodingService, etc.)
- **Not:** Separate microservices
- **Rationale:** Monolithic backend with domain modules

### Decision 6: Content Generation with Constraints ✅
- **Approach:** AI generation with educational validation pipeline
- **Safety:** All generated content must pass validation before use
- **Rationale:** AI accelerates content creation but must respect pedagogy

### Decision 7: Multilingual via Translation Table ✅
- **Model:** Translation table (entityType, entityId, field, language, value)
- **Languages:** en, ar, ar-EG
- **Rationale:** Flexible, supports all entity types

---

## SECTION C: IMPLEMENTATION PLAN

### Priority 1: Fix Critical Broken Issues (Week 1)

**1.1 Fix Mission-Activity Linkage**
- [x] Create `MissionActivity` model
- [x] Migration script
- [x] Update `missions.service.ts` to use proper linkage
- [ ] Seed mission-activity relationships

**1.2 Add Concept Layer**
- [x] Create `Concept` model
- [x] Create `ConceptPrerequisite` model
- [x] Migration script
- [x] Created ConceptService with prerequisite checking
- [ ] Seed concept data for existing competencies

### Priority 2: Learning Graph Foundation (Week 1-2)

**2.1 Prerequisite System**
- [x] ConceptPrerequisite relationships
- [x] Prerequisite checking service
- [x] Unlock status logic
- [x] Recursive traversal for dependency chains (cycle detection)
- [x] CompetencyPrerequisite model for high-level dependencies

**2.2 Learning Paths**
- [x] LearningPath model
- [x] LearningPathNode model
- [x] Path progression tracking (LearningPathProgress)
- [x] Path recommendation based on mastery
- [x] LearningPathService with full CRUD

### Priority 3: Age Adaptation (Week 2)

**3.1 Age Variant Infrastructure**
- [x] AgeVariant model with ScaffoldLevel enum
- [x] ContentAdaptationService
- [x] Age-appropriate content retrieval (activity, objective, mission)
- [x] Age configs (AGE_8_9, AGE_10_11, AGE_12_14)
- [ ] Seed age variants for existing activities

**3.2 Age-Aware Services**
- [ ] Update activity evaluator with age context
- [x] AI services already have age adaptation (Phase 3)
- [x] Character service already age-appropriate (Phase 3)

### Priority 4: Content Engine (Week 2-3)

**4.1 Content Models**
- [ ] ContentItem model (versioning, status, metadata)
- [ ] ContentValidationService
- [ ] Content lifecycle: DRAFT → VALIDATED → PUBLISHED

**4.2 Content Generation**
- [ ] Extend AI provider with generation tasks
- [ ] QuestionGenerator
- [ ] ActivityGenerator
- [ ] Validation pipeline

### Priority 5: Domain-Specific Foundations (Week 3-4)

**5.1 English Learning**
- [ ] EnglishStrand model/seed
- [ ] English activity types (LISTENING, SPEAKING, READING, WRITING)
- [ ] EnglishService
- [ ] CEFR mapping

**5.2 Coding Learning**
- [ ] CodingConcept model/seed (18 concepts)
- [ ] Coding activity types (BLOCK_CODING, CODE_COMPLETION, CODE_DEBUGGING)
- [ ] CodingService
- [ ] Sandbox adapter interface (implementation deferred)

**5.3 AI Literacy**
- [ ] AILiteracyConcept model/seed
- [ ] Age-appropriate AI curriculum
- [ ] AILiteracyService

**5.4 Entrepreneurship**
- [ ] EntrepreneurshipConcept model/seed
- [ ] Business simulation structures
- [ ] EntrepreneurshipService

**5.5 Financial Literacy**
- [ ] FinancialConcept model/seed
- [ ] Age-appropriate money concepts
- [ ] FinancialService

### Priority 6: Multilingual Support (Week 4)

**6.1 Translation Infrastructure**
- [ ] Translation model
- [ ] TranslationService
- [ ] Language detection/switching
- [ ] Seed translations (Arabic + English) for core domains

### Priority 7: Learning Events & Analytics (Week 4-5)

**7.1 Event System**
- [x] LearningEvent model (18 event types)
- [x] LearningEventService
- [x] Event recording methods (activity, mastery, conversation, project)
- [x] Analytics queries (stats, patterns, session summary)
- [ ] Integration into existing services (missions, mastery, AI)

### Priority 8: Enhanced Assessment (Week 5)

**8.1 Assessment Models**
- [ ] Assessment model (separate from Activity)
- [ ] AssessmentItem model
- [ ] DiagnosticAssessment
- [ ] FormativeAssessment
- [ ] SummativeAssessment

**8.2 Assessment Service**
- [ ] AssessmentService
- [ ] Diagnostic flow
- [ ] Assessment to mastery linkage

### Priority 9: Enhanced Projects (Week 5-6)

**9.1 Project Extensions**
- [ ] ProjectMilestone model
- [ ] Rubric + RubricCriterion models
- [ ] ProjectReflection model
- [ ] Update ProjectsService

**9.2 Portfolio**
- [ ] Portfolio evidence linkage
- [ ] Mastery evidence from projects
- [ ] Rich portfolio view

### Priority 10: Testing & Documentation (Ongoing)

**10.1 Testing**
- [ ] Unit tests for new services
- [ ] Integration tests for learning flows
- [ ] Test prerequisite checking
- [ ] Test age adaptation
- [ ] Test content validation

**10.2 Documentation**
- [ ] API documentation for new endpoints
- [ ] Service documentation
- [ ] Migration guides
- [ ] Update architecture docs

---

## SECTION D: DATABASE SCHEMA ADDITIONS

### New Models (12 models)

```prisma
// Concept layer
model Concept {
  id String @id @default(uuid())
  competencyId String
  name String
  slug String @unique
  description String?
  order Int @default(0)
  isActive Boolean @default(true)
  
  competency Competency @relation(fields: [competencyId], references: [id])
  objectives LearningObjective[]
  prerequisites ConceptPrerequisite[] @relation("concept")
  dependents ConceptPrerequisite[] @relation("prerequisite")
}

model ConceptPrerequisite {
  id String @id @default(uuid())
  conceptId String
  prerequisiteId String
  type PrerequisiteType @default(REQUIRED)
  
  concept Concept @relation("concept", fields: [conceptId], references: [id])
  prerequisite Concept @relation("prerequisite", fields: [prerequisiteId], references: [id])
  
  @@unique([conceptId, prerequisiteId])
}

enum PrerequisiteType {
  REQUIRED
  RECOMMENDED
  COREQUISITE
}

// Learning paths
model LearningPath {
  id String @id @default(uuid())
  domainId String
  name String
  slug String @unique
  description String?
  ageBand AgeBand?
  order Int @default(0)
  isActive Boolean @default(true)
  
  domain Domain @relation(fields: [domainId], references: [id])
  nodes LearningPathNode[]
}

model LearningPathNode {
  id String @id @default(uuid())
  pathId String
  entityType String // "SKILL", "CONCEPT", "MISSION"
  entityId String
  order Int @default(0)
  isOptional Boolean @default(false)
  
  path LearningPath @relation(fields: [pathId], references: [id])
}

// Age adaptation
model AgeVariant {
  id String @id @default(uuid())
  entityType String
  entityId String
  ageBand AgeBand
  framing String // Age-appropriate presentation
  languageLevel String? // "simple", "moderate", "complex"
  scaffoldLevel ScaffoldLevel @default(GUIDED)
  surface String? // "visual", "blocks", "text"
  content Json? // Age-specific content overrides
  
  @@unique([entityType, entityId, ageBand])
}

enum ScaffoldLevel {
  MODELLED
  GUIDED
  COACHED
  INDEPENDENT
}

// Content management
model ContentItem {
  id String @id @default(uuid())
  type ContentType
  title String
  content Json
  metadata Json?
  language String @default("en")
  ageBand AgeBand?
  domainId String?
  objectiveId String?
  difficulty DifficultyLevel?
  status ContentStatus @default(DRAFT)
  version Int @default(1)
  generatedBy String? // "AI" or userId
  validatedBy String?
  validatedAt DateTime?
}

enum ContentType {
  ACTIVITY
  QUESTION
  STORY
  SCENARIO
  HINT
  EXPLANATION
  PROJECT_BRIEF
  PRACTICE_SET
}

enum ContentStatus {
  DRAFT
  VALIDATING
  VALIDATED
  PUBLISHED
  DEPRECATED
  REJECTED
}

// Multilingual
model Translation {
  id String @id @default(uuid())
  entityType String
  entityId String
  field String
  language String // "en", "ar", "ar-EG"
  value Text
  
  @@unique([entityType, entityId, field, language])
}

// Learning events
model LearningEvent {
  id String @id @default(uuid())
  learnerId String
  type LearningEventType
  entityType String?
  entityId String?
  data Json?
  sessionId String?
  createdAt DateTime @default(now())
  
  @@index([learnerId])
  @@index([type])
  @@index([createdAt])
}

enum LearningEventType {
  ACTIVITY_STARTED
  ACTIVITY_COMPLETED
  ANSWER_SUBMITTED
  HINT_REQUESTED
  MASTERY_CHANGED
  PROJECT_STARTED
  MISSION_STARTED
  CONVERSATION_STARTED
  // ... 18 types total
}

// Mission-Activity linkage
model MissionActivity {
  id String @id @default(uuid())
  missionId String
  activityId String
  order Int @default(0)
  isRequired Boolean @default(true)
  
  mission Mission @relation(fields: [missionId], references: [id])
  activity Activity @relation(fields: [activityId], references: [id])
  
  @@unique([missionId, activityId])
}

// Projects enhancement
model ProjectMilestone {
  id String @id @default(uuid())
  projectId String
  title String
  description String?
  targetDate DateTime?
  status String @default("PENDING")
  order Int @default(0)
  
  project Project @relation(fields: [projectId], references: [id])
}

model Rubric {
  id String @id @default(uuid())
  entityType String
  entityId String
  title String
  criteria RubricCriterion[]
}

model RubricCriterion {
  id String @id @default(uuid())
  rubricId String
  name String
  description String
  order Int @default(0)
  levels Json // [{level, description, score}]
  
  rubric Rubric @relation(fields: [rubricId], references: [id])
}
```

---

## SECTION E: API CONTRACTS

### New Endpoints

**Learning Graph**
- GET `/api/concepts` — List concepts
- GET `/api/concepts/:id/prerequisites` — Get prerequisite chain
- GET `/api/concepts/:id/unlock-status` — Check if unlocked for learner
- GET `/api/paths` — List learning paths
- GET `/api/paths/:id/progress` — Get learner progress through path

**Content**
- GET `/api/content` — List content items
- POST `/api/content/generate` — Generate content with constraints
- POST `/api/content/:id/validate` — Validate content
- PATCH `/api/content/:id/status` — Update content status

**Age Adaptation**
- GET `/api/age-config/:ageBand` — Get age-band configuration
- GET `/api/adapted-content/:activityId` — Get age-adapted activity

**Events**
- POST `/api/events` — Record learning event
- GET `/api