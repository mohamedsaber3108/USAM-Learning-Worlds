# USAM Implementation Roadmap

**Date:** 2026-08-12
**Phase:** Educational Core Foundation - Post-Analysis

---

## Executive Summary

**Current State:** Backend has 9 working modules with 49 endpoints, evidence-based mastery, ZPD-based adaptive learning, and AWS Bedrock AI integration. Deployed and functional at kids.usamif.com.

**Critical Finding:** The backend is MORE COMPLETE than initially assumed. This is NOT a "start from scratch" situation. This is an EXTENSION AND REFINEMENT phase.

---

## Phase 0: STOP AND VERIFY (THIS PHASE - Complete)

**Status:** ✅ COMPLETE

**What Was Done:**
1. Deep inspection of entire repository (backend, frontend, src/, docs, root)
2. Verified all 49 API endpoints work and have real logic
3. Confirmed mastery algorithm is production-grade (FSRS-inspired)
4. Confirmed adaptive engine (ZPD calculator) is implemented
5. Identified two-frontend situation (src/ design reference, frontend/ deployed)
6. Mapped gaps between backend capabilities and full USAM vision
7. Created 6 architecture documents

**Key Discoveries:**
- Backend is ~40% complete for educational core (not 0%)
- Mastery system is robust and should NOT be replaced
- Age adaptation is the biggest architectural gap
- Learning graph (prerequisites) is missing
- Domain-specific engines (English, Coding, etc.) are entirely missing

---

## Phase 1: Foundation Fixes (1-2 weeks)

**Goal:** Fix broken/incomplete parts of existing implementation

### 1.1 Fix Mission-Activity Linkage
- **Problem:** `getMission()` fetches ALL activities globally (`take: 10`), not mission-specific ones
- **Solution:** Create `MissionActivity` junction table, update `missions.service.ts`
- **Files:** schema.prisma, missions.service.ts
- **Test:** Mission detail page should show correct activities for each mission

### 1.2 Add Learning Graph Foundation
- **Problem:** No prerequisite relationships
- **Solution:** 
  - Add `ConceptPrerequisite` model
  - Add prerequisite check logic in adaptive service
  - Add unlock status endpoint
- **Files:** schema.prisma, new `learning-graph.service.ts`
- **Test:** Activities locked by prerequisites can't be started

### 1.3 Extend Domain Seed Data
- **Problem:** Only 12 domains seeded, requirements specify 20+
- **Solution:** Update seed-full.js with all required domains:
  - ENGLISH, CODING, AI_LITERACY, DIGITAL_LITERACY
  - COMPUTATIONAL_THINKING, LOGICAL_THINKING, CRITICAL_THINKING
  - PROBLEM_SOLVING, CREATIVE_THINKING, CREATIVITY
  - COMMUNICATION, COLLABORATION, DESIGN, MEDIA_CREATION
  - RESEARCH_SKILLS, ENTREPRENEURSHIP, BUSINESS
  - FINANCIAL_LITERACY, SCIENCE, FUTURE_SKILLS, CAREER_EXPLORATION
- **Files:** prisma/seed-full.js
- **Test:** GET /api/domains returns all 20+ domains

### 1.4 Fix XPGain Foreign Key
- **Problem:** `XPGain.learnerId` references `Progression.id` instead of `Learner.id`
- **Solution:** Update schema FK, write migration
- **Files:** schema.prisma
- **Test:** XP awards work correctly

---

## Phase 2: Age Adaptation Infrastructure (2-3 weeks)

**Goal:** Enable age-appropriate learning delivery (8-9, 10-11, 12-14)

### 2.1 Age Variant Content Model
- **Add:** `AgeVariant` table
- **Fields:** entityType, entityId, ageBand, framing, languageLevel, scaffoldLevel, surface, content (JSON)
- **Migrate:** Existing activities to have age variants
- **Files:** schema.prisma, new migration

### 2.2 Age-Aware Content Service
- **Create:** `ContentAdaptationService`
- **Logic:**
  - Given activityId + learner's ageBand → return adapted content
  - Fallback to base content if no variant exists
- **API:** GET `/api/age-adaptation/adapted-content/:activityId`
- **Files:** new `content-adaptation.service.ts`

### 2.3 Update Activity Evaluator
- **Change:** Accept age band in evaluation context
- **Adjust:** Explanation key-point thresholds by age
- **Adjust:** CODE keyword requirements by age
- **Files:** activity-evaluator.ts

### 2.4 Seed Age-Appropriate Content
- **Create:** Age variants for seed activities
- **Example:** Same math problem, three framings (8-9: visual, 10-11: word problem, 12-14: abstract)
- **Files:** prisma/seed-age-variants.ts

---

## Phase 3: Learning Graph & Paths (2-3 weeks)

**Goal:** Implement prerequisite system and learning paths

### 3.1 Concept Layer
- **Add:** `Concept` model (between Competency and LearningObjective)
- **Reason:** Concepts are atomic learning units (e.g., "variables" is a concept under "Python" skill)
- **Migrate:** Move objectives under concepts
- **Files:** schema.prisma, migration

### 3.2 Prerequisite System
- **Implement:** Prerequisite checking before activity start
- **Logic:** Can't start activity if prerequisite concepts not mastered (confidence >= 0.7)
- **API:** 
  - GET `/api/concepts/:id/prerequisites`
  - GET `/api/concepts/:id/unlock-status`
- **Files:** learning-graph.service.ts

### 3.3 Learning Paths
- **Add:** `LearningPath` and `LearningPathNode` models
- **Purpose:** Curated sequences through curriculum
- **Example:** "Python Fundamentals" path = [variables, conditionals, loops, functions]
- **API:**
  - GET `/api/paths`
  - GET `/api/paths/:id/progress`
- **Files:** schema.prisma, learning-path.service.ts

### 3.4 Update Recommendations
- **Enhance:** RecommendationService to use prerequisite graph
- **Logic:** Only recommend available (unlocked) content
- **Files:** recommendation.service.ts

---

## Phase 4: English Learning Engine (3-4 weeks)

**Goal:** Build complete English domain with 14 strands and 10 venues

### 4.1 English Strand Model
- **Add:** `EnglishStrand` table
- **Fields:** id (listening, speaking, reading...), emphasis by age band
- **Seed:** 14 strands with descriptions
- **Files:** schema.prisma, english-strands-seed.ts

### 4.2 English Activity Types
- **Extend:** ActivityType enum with English-specific types
  - LISTENING_COMPREHENSION
  - SPEAKING_PRACTICE
  - READING_PASSAGE
  - WRITING_PROMPT
  - VOCABULARY_MATCH
  - GRAMMAR_EXERCISE
  - PRONUNCIATION_CHECK (voice future)
  - CONVERSATION_ROLEPLAY
- **Files:** schema.prisma

### 4.3 English Venues (Frontend-Backend Mapping)
- **Create:** Venue metadata (no new table, just seed data)
- **Link:** Activities to strands and venues via tags/metadata
- **Seed:** 100+ English activities across strands
- **Files:** english-activities-seed.ts

### 4.4 CEFR Mapping (Optional)
- **Add:** CEFR level field to Competency
- **Map:** Competencies to A1, A2, B1, B2 (for 8-14 age range)
- **API:** GET `/api/english/cefr-profile`
- **Files:** competency schema, english.service.ts

---

## Phase 5: Coding Learning Engine (4-5 weeks)

**Goal:** Build coding progression with concept tracking and sandbox preparation

### 5.1 Coding Concept Model
- **Add:** `CodingConcept` table
- **Fields:** id (sequences, loops, variables...), cognitive level, surface type
- **Seed:** 18 concepts from computational-thinking to ai-coding
- **Files:** schema.prisma, coding-concepts-seed.ts

### 5.2 Coding Activity Types
- **Extend:** ActivityType enum
  - UNPLUGGED_PUZZLE
  - BLOCK_CODING
  - CODE_COMPLETION
  - CODE_DEBUGGING
  - CODE_EXPLANATION
  - CODE_PROJECT
- **Files:** schema.prisma

### 5.3 Sandbox Adapter Interface
- **Create:** Abstraction for code execution
- **Interface:**
  ```typescript
  interface CodeSandbox {
    execute(code: string, language: string, testCases?: any[]): Promise<ExecutionResult>
  }
  ```
- **Implementations:**
  - KeywordSandbox (current - for MVP)
  - PyodideSandbox (future - Python)
  - SandpackAdapter (future - web dev)
- **Files:** new `sandbox/` module

### 5.4 Coding Activities Seed
- **Create:** 150+ coding activities
- **Progression:** unplugged (age 8-9) → blocks (age 10-11) → text (age 12-14)
- **Files:** coding-activities-seed.ts

---

## Phase 6: Content Generation with Constraints (2-3 weeks)

**Goal:** AI-generated content that respects educational structure

### 6.1 Content Generation Service
- **Enhance:** BedrockService with structured generation
- **New Methods:**
  - `generateActivity(objective, difficulty, age, type)`
  - `generateQuestion(concept, age, difficulty)`
  - `generateStory(theme, age, duration)`
  - `generateProjectBrief(skills, age, interests)`
- **Files:** bedrock.service.ts

### 6.2 Content Validation Pipeline
- **Create:** ContentValidationService
- **Checks:**
  - Age appropriateness (LLM check)
  - Objective alignment (embedding similarity if using pgvector later)
  - Difficulty calibration
  - Safety (existing moderation)
  - Answer key correctness
- **Files:** content-validation.service.ts

### 6.3 Content Lifecycle
- **Add:** `ContentItem` model with status (DRAFT, VALIDATED, PUBLISHED, DEPRECATED)
- **Workflow:** Generated → Validated → Published → Used in activities
- **Files:** schema.prisma, content-items.service.ts

---

## Phase 7: Character Behavior Engine (2-3 weeks)

**Goal:** Make characters contextually intelligent

### 7.1 Character Context Service
- **Create:** Service that assembles learner state for character AI
- **Context includes:**
  - Current mission, activity, objective
  - Recent mastery changes
  - Learner's age band
  - Recent mistakes/successes
  - Time since last interaction
- **Files:** character-context.service.ts

### 7.2 Character Interaction Logging
- **Add:** `CharacterInteraction` table
- **Purpose:** Track what characters say and when
- **Use:** Learning analytics, character memory
- **Files:** schema.prisma

### 7.3 Multi-Character Support
- **Extend:** CharacterRole enum with all 14 roles from src/ types
- **Seed:** Multiple characters (Azouz + domain mentors)
- **Logic:** Character selection based on domain/activity type
- **Files:** character-seed.ts, character.service.ts

### 7.4 Character-AI Integration
- **Create:** Methods in BedrockService for character speech
- **Input:** Character personality + learner context + current situation
- **Output:** Age-appropriate, in-character response
- **Files:** bedrock.service.ts

---

## Phase 8: Multilingual Support (2-3 weeks)

**Goal:** Arabic + Egyptian Arabic + English

### 8.1 Translation Model
- **Add:** `Translation` table
- **Fields:** entityType, entityId, field, language, value
- **Example:** Activity title in "en", "ar", "ar-EG"
- **Files:** schema.prisma

### 8.2 Translation Service
- **Create:** Service to fetch translated content
- **API:** GET `/api/translations/:entityType/:entityId?lang=ar`
- **Fallback:** English if translation missing
- **Files:** translation.service.ts

### 8.3 Seed Translated Content
- **Translate:** Core domain names, skill names, mission titles
- **Use:** AI translation (Bedrock) + human review
- **Files:** translation-seed.ts

### 8.4 Language-Aware Character Speech
- **Update:** Character context service to include language
- **Logic:** Characters speak in learner's preferred language
- **Dialect:** Egyptian Arabic for conversational, MSA for formal learning
- **Files:** character-context.service.ts

---

## Phase 9: Enhanced Project Engine (2 weeks)

**Goal:** Add milestones, rubrics, reflection

### 9.1 Project Milestones
- **Add:** `ProjectMilestone` table
- **Fields:** title, description, targetDate, status, evidence
- **API:** CRUD for milestones within project
- **Files:** schema.prisma, projects.service.ts

### 9.2 Project Rubrics
- **Add:** `ProjectRubric` and `RubricCriterion` tables
- **Purpose:** Structured assessment of projects
- **Fields:** criterion, levels (novice, developing, proficient, advanced), descriptions
- **Files:** schema.prisma

### 9.3 Project Assessment
- **Logic:** AI-assisted rubric scoring + human review
- **API:** POST `/api/projects/:id/assess`
- **Files:** projects.service.ts, bedrock.service.ts

### 9.4 Reflection System
- **Add:** `ProjectReflection` table
- **Prompts:** What did you learn? What was hard? What would you do differently?
- **Use:** Metacognition support, mastery evidence
- **Files:** schema.prisma, projects.service.ts

---

## Phase 10: Learning Analytics & Events (1-2 weeks)

**Goal:** Structured event system for adaptation and insights

### 10.1 Learning Event Model
- **Add:** `LearningEvent` table
- **Types:** 18 event types (activity_started, mastery_changed, hint_requested, etc.)
- **Purpose:** Fine-grained learning behavior tracking
- **Files:** schema.prisma

### 10.2 Event Recording Service
- **Create:** Lightweight event recording
- **API:** POST `/api/events`
- **Integration:** Trigger from missions, mastery, AI modules
- **Files:** events.service.ts

### 10.3 Analytics Service
- **Create:** Aggregation queries over events
- **Metrics:** Time on task, hint usage rate, success rate trends
- **API:** GET `/api/events/analytics?learnerId=...&days=7`
- **Files:** analytics.service.ts

### 10.4 Parent Reports Enhancement
- **Update:** Parent dashboard with event-based insights
- **Add:** "Your child struggled with X this week"
- **Add:** "Your child showed growth in Y"
- **Files:** parents.service.ts

---

## Phase 11: Testing & Quality (Ongoing)

**Goal:** Ensure reliability and educational integrity

### 11.1 Unit Tests
- **Priority:** Mastery algorithm, activity evaluator, ZPD calculator
- **Framework:** Jest (already configured)
- **Target:** 70% coverage on educational core

### 11.2 Integration Tests
- **Test:** Full learning flows (register → mission → submit → mastery update)
- **Files:** test/*.e2e-spec.ts

### 11.3 Educational Validation
- **Review:** Content accuracy, age appropriateness, pedagogical soundness
- **Process:** Human review of AI-generated content before publish

---

## NOT IN SCOPE (Deferred to Later)

- Voice infrastructure (STT/TTS)
- Real-time collaboration (WebSocket)
- Advanced AI orchestration (multi-agent)
- Code sandbox execution (Pyodide/Sandpack integration)
- Full social features (guilds, teams, competitions)
- Notification system (push notifications)
- OAuth2 social sign-in
- Mobile app
- Offline support
- Full i18n beyond Arabic/English

---

## Estimated Timeline

| Phase | Weeks | Dependencies |
|-------|-------|--------------|
| 0. Analysis | DONE | — |
| 1. Foundation Fixes | 1-2 | None |
| 2. Age Adaptation | 2-3 | Phase 1 |
| 3. Learning Graph | 2-3 | Phase 1 |
| 4. English Engine | 3-4 | Phase 2 |
| 5. Coding Engine | 4-5 | Phase 2, 3 |
| 6. Content Generation | 2-3 | Phase 2 |
| 7. Character Behavior | 2-3 | Phase 6 |
| 8. Multilingual | 2-3 | Phase 2 |
| 9. Enhanced Projects | 2 | None (independent) |
| 10. Analytics | 1-2 | None (independent) |

**Total:** 20-30 weeks (5-7 months) for complete educational core

**MVP Milestone** (Phases 1-3): 5-8 weeks
**Production-Ready** (Phases 1-8): 18-24 weeks

---

## Success Criteria

After all phases, USAM must demonstrate:
1. ✅ Evidence-based mastery (not completion-based)
2. ✅ Age-appropriate adaptation (8-9, 10-11, 12-14)
3. ✅ Prerequisite-aware progression
4. ✅ Domain-specific engines (English, Coding)
5. ✅ AI-powered characters with context
6. ✅ Multilingual support (Arabic + English)
7. ✅ Project-based learning with assessment
8. ✅ Parent visibility and controls
9. ✅ Safe, moderated community
10. ✅ Learning analytics for adaptation
