# USAM Engine Map

**Date:** 2026-08-12
**Phase:** Educational Core Foundation - Analysis

---

## Engine Status Legend

| Status | Meaning |
|--------|---------|
| IMPLEMENTED | Working code with real logic |
| PARTIAL | Code exists but incomplete or MVP-only |
| SCHEMA_ONLY | Database model exists, no business logic |
| CONTRACT_ONLY | Frontend types/interfaces defined, no backend |
| MISSING | Not implemented anywhere |

---

## 1. LEARNING ENGINES

### 1.1 Mastery Engine — IMPLEMENTED
- **Location:** `backend/src/modules/mastery/`
- **Files:** mastery.service.ts, mastery-confidence.algorithm.ts, mastery.processor.ts
- **Capabilities:**
  - Evidence recording (8 types)
  - FSRS-inspired confidence calculation
  - Weighted success rate (recency bias)
  - Evidence diversity scoring
  - Spacing effect detection
  - Forgetting curve decay
  - Mastery state transitions (7 states)
  - Spaced review scheduling
  - Async recalculation (Bull queue)
  - Overview by domain aggregation
  - Review-due detection
  - Learning goals (weak areas)

### 1.2 Adaptive Engine — IMPLEMENTED (Basic)
- **Location:** `backend/src/modules/adaptive/`
- **Files:** zpd-calculator.service.ts, recommendation.service.ts
- **Capabilities:**
  - ZPD profiling (optimal difficulty, strengths, weaknesses)
  - Difficulty recommendation per competency
  - Growth velocity (improvement trend)
  - Level-up recommendation
  - Personalized recommendations (review, mission, activity, challenge)
  - Learning path per skill
  - Next-activity selection (avoiding repeats)
- **Missing:**
  - No age-based adaptation
  - No interest-based filtering
  - No engagement/motivation awareness
  - No misconception tracking
  - No prerequisite enforcement
  - No alternative path routing

### 1.3 Assessment Engine — PARTIAL
- **Location:** `backend/src/modules/missions/evaluators/activity-evaluator.ts`
- **Capabilities:**
  - 7 activity type evaluators
  - Partial credit scoring
  - Evidence type mapping
- **Missing:**
  - No dedicated assessment module
  - No diagnostic assessment
  - No formative assessment flow
  - No summative assessment
  - No rubric system
  - No project assessment
  - No creative assessment AI
  - No self-assessment

### 1.4 Content Engine — PARTIAL
- **Location:** Schema (Activity.content JSON)
- **Capabilities:**
  - Activity content stored as structured JSON
  - 7 content schemas (per activity type)
  - Seed data with 25 real activities
- **Missing:**
  - No content generation pipeline
  - No content validation
  - No content lifecycle (draft/published/deprecated)
  - No content versioning
  - No age-variant content
  - No difficulty calibration
  - No content tagging beyond type

### 1.5 Spaced Review Engine — IMPLEMENTED (Embedded)
- **Location:** `backend/src/modules/mastery/mastery-confidence.algorithm.ts`
- **Capabilities:**
  - Review date scheduling based on confidence
  - Intervals: 1d, 3d, 7d, 14d, 30d
  - Review-due query
- **Missing:**
  - No multiple algorithm support
  - No learner-specific interval adjustment
  - No failed-review handling (interval reset)
  - No interleaving strategy

### 1.6 Learning Graph Engine — MISSING
- **Required by:** `src/types/curriculum.ts` (CurriculumNode.prerequisiteIds, relatedIds)
- **Needed:**
  - Prerequisite relationships
  - Dependency resolution
  - Unlock logic
  - Graph traversal
  - Alternative paths
  - Remediation paths

### 1.7 Recommendation Engine — IMPLEMENTED (Basic)
- **Location:** `backend/src/modules/adaptive/recommendation.service.ts`
- **Capabilities:**
  - 4 recommendation types (REVIEW, MISSION, ACTIVITY, PROJECT)
  - Priority-based ranking
  - ZPD-aware difficulty matching
  - Completed-mission exclusion
- **Missing:**
  - No interest-based filtering
  - No engagement optimization
  - No recommendation explanation storage
  - No recommendation feedback loop
  - No A/B testing
  - No recommendation diversity (all math ≠ good)

---

## 2. DOMAIN-SPECIFIC ENGINES

### 2.1 English Learning Engine — CONTRACT_ONLY
- **Frontend Types:** `src/types/english.ts`
  - 14 strands (listening, speaking, reading, writing, vocabulary, grammar, etc.)
  - 10 venues (conversation rooms, story missions, listening lab, etc.)
  - CEFR-compatible progression
  - Age-band emphasis weighting
- **Backend:** No English-specific logic exists
- **Gap:** Entire engine must be created

### 2.2 Coding Learning Engine — CONTRACT_ONLY
- **Frontend Types:** `src/types/coding.ts`
  - 18 concepts (computational-thinking → ai-coding)
  - 6 surfaces (unplugged, blocks, blocks-plus-text, text, project)
  - 6 runtime adapters (scratch, blockly, pyodide, javascript, html-css, react)
  - Mentor support types (7 kinds: nudge, question, analogy, etc.)
  - Code execution sandbox adapter interface
- **Backend:** CODE activity type with keyword matching only
- **Gap:** Full coding progression, sandbox integration, concept tracking

### 2.3 AI Literacy Engine — CONTRACT_ONLY
- **Frontend Types:** `src/types/ai-literacy.ts`
- **Backend:** No AI-literacy-specific educational logic
- **Gap:** AI learning progression, prompt engineering activities

### 2.4 Creative Thinking Engine — MISSING
- **Frontend:** References in service contracts
- **Backend:** CREATE activity type exists (auto-approve)
- **Gap:** No structured creativity assessment, no ideation support

### 2.5 Critical Thinking Engine — MISSING
- **Frontend:** Domain exists in seed data
- **Backend:** No critical-thinking-specific logic
- **Gap:** Evidence evaluation, reasoning assessment

### 2.6 Problem Solving Engine — MISSING
- **Frontend:** SOLVE activity type
- **Backend:** SOLVE evaluator exists (answer comparison)
- **Gap:** No process tracking, no hypothesis support

### 2.7 Entrepreneurship Engine — CONTRACT_ONLY
- **Frontend Types:** `src/types/venture.ts` (business simulation)
- **Backend:** No entrepreneurship logic
- **Gap:** Simulation engine, scenario generation

### 2.8 Financial Literacy Engine — CONTRACT_ONLY
- **Frontend Types:** `src/types/financial-literacy.ts`
- **Backend:** No financial literacy logic
- **Gap:** Age-appropriate financial concepts

---

## 3. PLATFORM ENGINES

### 3.1 Character Engine — SCHEMA_ONLY
- **Database:** Character model (name, role, personality, systemPrompt)
- **Seed:** 1 character ("Azouz" - GUIDE role)
- **Missing:**
  - No character behavior/state machine
  - No character-learning context integration
  - No multi-character orchestration
  - No character memory
  - No character mood/expression logic
  - No conversation history

### 3.2 Voice Engine — MISSING
- **Frontend Types:** VoiceState defined (idle, listening, thinking, speaking, etc.)
- **Backend:** No voice infrastructure
- **Gap:** STT, TTS, session management, streaming

### 3.3 AI Orchestration Engine — PARTIAL
- **Location:** `backend/src/modules/ai/bedrock.service.ts`
- **Capabilities:**
  - Single provider (AWS Bedrock)
  - Single model (Claude 3.5 Sonnet)
  - 4 use cases (feedback, hint, explain, analyze)
  - Token usage tracking
- **Missing:**
  - No provider abstraction (locked to Bedrock)
  - No multi-model routing
  - No fallback handling
  - No cost optimization
  - No agent orchestration
  - No conversation management
  - No context assembly

### 3.4 Content Generation Engine — PARTIAL
- **Capabilities:** AI can generate feedback, hints, explanations
- **Missing:**
  - No activity generation
  - No question generation
  - No story generation
  - No project generation
  - No validation pipeline
  - No content lifecycle management

### 3.5 Project Engine — IMPLEMENTED (Basic CRUD)
- **Location:** `backend/src/modules/projects/projects.service.ts`
- **Capabilities:**
  - Create/Read/Update/Delete
  - Visibility permissions
  - Portfolio view
  - Showcase workflow
  - Community browse
- **Missing:**
  - No milestones
  - No tasks
  - No rubric
  - No AI assistance
  - No artifact management
  - No version control
  - No reflection system
  - No mastery evidence linkage

### 3.6 Gamification Engine — IMPLEMENTED
- **Location:** `backend/src/modules/gamification/`
- **Capabilities:**
  - XP with source tracking and dedup
  - Level system (progressive curve)
  - Coins (earn/spend)
  - Practice streaks (current + longest)
  - Achievements (milestone-based)
  - Leaderboard (opt-in)
- **Correctly separated from mastery** ✓

### 3.7 Community Engine — IMPLEMENTED (Basic)
- **Location:** `backend/src/modules/community/community.service.ts`
- **Capabilities:**
  - Community feed (public projects)
  - Search
  - Content reporting
  - Moderation workflow
  - Community stats
- **Missing:**
  - No friends/teams/guilds
  - No collaborative projects
  - No competitions
  - No comments
  - No real-time features

### 3.8 Parent Engine — IMPLEMENTED
- **Location:** `backend/src/modules/parents/parents.service.ts`
- **Capabilities:**
  - Child linking with consent
  - Child dashboard
  - Learning progress reports
  - Activity logs
  - Time limits
  - Family summary
- **Missing:**
  - No consent management workflow
  - No notification to parents
  - No AI control settings
  - No community control settings

### 3.9 Safety Engine — IMPLEMENTED
- **Location:** `backend/src/modules/ai/moderation.service.ts`
- **Capabilities:**
  - AI content moderation (K-12 categories)
  - Severity classification
  - Auto-quarantine
  - Moderator review
  - Moderation statistics
  - Fail-safe (blocks on error)
- **Missing:**
  - No prompt injection detection
  - No rate abuse detection
  - No cross-user data leakage prevention
  - No memory scope enforcement

### 3.10 Analytics/Telemetry Engine — MISSING
- **Required by:** Phase requirements, parent reports
- **Existing data:** Evidence, ActivityAttempt, XPGain, MissionRun
- **Missing:**
  - No dedicated event system
  - No learning analytics beyond mastery
  - No engagement metrics
  - No drop-off detection
  - No A/B experiment support

### 3.11 Notification Engine — MISSING
- **Frontend Types:** Notification interface defined in `src/types/domain.ts`
- **Backend:** No notification system
- **Gap:** Push notifications, in-app, parent alerts

### 3.12 Search Engine — MISSING
- **Community has basic text search** (Prisma contains)
- **Missing:** Full-text search, curriculum search, content discovery

---

## 4. INTEGRATION MAP

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  src/ (Lovable - Full UI)    │    frontend/ (Deployed SPA)      │
└────────────────────┬────────────────────────┬───────────────────┘
                     │                        │
                     ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (/api)                            │
│  Auth │ Missions │ Mastery │ Adaptive │ Projects │ Gamification │
│  Community │ Parents │ AI │ (Future: Content, Characters, Voice)│
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│   EDUCATIONAL CORE       │    │    PLATFORM SERVICES             │
│  • Mastery Algorithm     │    │  • AI (Bedrock)                  │
│  • ZPD Calculator        │    │  • Moderation                    │
│  • Activity Evaluator    │    │  • Gamification                  │
│  • Recommendation        │    │  • Community                     │
│  • Review Scheduler      │    │  • Parent                        │
└──────────┬──────────────┘    └──────────┬──────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                     │
│  PostgreSQL (20 tables) │ Redis (Queue) │ S3 (Future: files)    │
└─────────────────────────────────────────────────────────────────┘
```
