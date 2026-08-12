# USAM Master Backend Architecture

**Date:** 2026-08-12
**Phase:** Educational Core Foundation (Phase 01 - Analysis & Design)
**Status:** ARCHITECTURE ANALYSIS COMPLETE - AWAITING IMPLEMENTATION APPROVAL

---

## 1. REPOSITORY STATE SUMMARY

### What Actually Exists

| Layer | Status | Details |
|-------|--------|---------|
| **Backend (NestJS)** | IMPLEMENTED (Foundation) | 9 modules, 49 endpoints, 20 DB models, real logic |
| **Frontend (frontend/)** | IMPLEMENTED (Lightweight) | React 18 + Vite, 11 pages, deployed at kids.usamif.com |
| **Frontend (src/)** | IMPLEMENTED (Full UI) | React 19 + TanStack Start, 130+ components, 17 service contracts, mock data only |
| **Database** | IMPLEMENTED | PostgreSQL 16, 20 Prisma models, deployed on EC2 |
| **AI** | IMPLEMENTED (AWS Bedrock) | Claude 3.5 Sonnet for feedback, hints, explanation, moderation |
| **Mastery** | IMPLEMENTED (FSRS-inspired) | Evidence-based, 7 states, spaced review scheduling |
| **Adaptive** | IMPLEMENTED (Basic) | ZPD calculator, difficulty recommendation, growth velocity |
| **Infrastructure** | DEPLOYED | EC2 t3.medium, Nginx + SSL, PM2, Redis |

### Two Frontends Problem

The repository contains TWO frontend codebases:
1. **`src/`** (Root) - The Lovable-generated TanStack Start app with 130+ components, rich type system (18 type files), 17 service contracts, SSR support. Uses mock data exclusively.
2. **`frontend/`** - A lightweight React SPA (11 pages) that actually connects to the backend via REST API. Currently deployed.

**Architecture Decision Required:** The `src/` frontend is the design-complete reference with proper educational types (CurriculumNode, AgeVariant, EnglishStrand, CodingConcept, etc.). The `frontend/` is the deployed runtime. The backend must serve both.

---

## 2. CURRENT BACKEND ARCHITECTURE

```
NestJS Application (Port 3001, /api prefix)
├── AppModule (root)
│   ├── DatabaseModule (Global - PrismaService)
│   ├── BullModule (Redis queue)
│   ├── AuthModule
│   │   ├── JWT Strategy (access + refresh tokens)
│   │   ├── RolesGuard (LEARNER, GUARDIAN, MODERATOR, ADMIN)
│   │   └── Register/Login/Refresh/Me
│   ├── MasteryModule
│   │   ├── MasteryConfidenceAlgorithm (FSRS-inspired)
│   │   ├── MasteryProcessor (Bull queue worker)
│   │   └── Evidence recording + recalculation
│   ├── MissionsModule
│   │   ├── ActivityEvaluator (7 types)
│   │   └── Start/Submit/Complete flow
│   ├── AIModule
│   │   ├── BedrockService (Claude 3.5 Sonnet)
│   │   ├── ModerationService (K-12 safety)
│   │   └── AIUsageService (token tracking)
│   ├── AdaptiveModule
│   │   ├── ZPDCalculatorService
│   │   └── RecommendationService
│   ├── ProjectsModule (CRUD + portfolio + showcase)
│   ├── GamificationModule (XP, levels, streaks, achievements, leaderboard)
│   ├── CommunityModule (feed, search, report, moderation)
│   └── ParentsModule (children, dashboard, progress, time limits)
```

---

## 3. DATABASE MODEL (20 Tables)

### Current Schema Hierarchy

```
User (identity)
├── Learner (ageBand, preferences)
│   ├── Progression (level, XP, coins)
│   ├── PracticeStreak
│   ├── MasteryRecord[] → Competency
│   │   └── Evidence[]
│   ├── MissionRun[] → Mission
│   │   └── ActivityAttempt[] → Activity
│   ├── Project[]
│   └── Guardianship[] → Guardian
└── Guardian (controls)

Domain
└── Skill
    └── Competency
        └── LearningObjective
            └── Activity (content: JSON)

Character (name, role, personality, systemPrompt)
AIUsageLog / ModerationLog / QuarantinedContent
```

---

## 4. WHAT USAM ALREADY HAS (Verified Working)

### 4.1 Educational Foundation
- [x] Domain → Skill → Competency → LearningObjective → Activity hierarchy
- [x] 7 activity types (SELECT, MATCH, SEQUENCE, CODE, EXPLAIN, CREATE, SOLVE)
- [x] 8 evidence types (KNOWLEDGE, APPLICATION, CREATION, EXPLANATION, CONVERSATION, PROBLEM_SOLVING, TRANSFER, REFLECTION)
- [x] 7 mastery states (NOT_STARTED → MASTERED)
- [x] FSRS-inspired mastery confidence algorithm
- [x] Forgetting curve (Ebbinghaus) with decay
- [x] Spaced review scheduling
- [x] Evidence diversity scoring
- [x] Spacing effect scoring

### 4.2 Adaptive Learning
- [x] ZPD (Zone of Proximal Development) calculator
- [x] Difficulty recommendation per competency
- [x] Growth velocity calculation
- [x] Review-due detection
- [x] Challenge readiness assessment
- [x] Personalized recommendations (4 types: review, mission, activity, challenge)
- [x] Learning path suggestion per skill

### 4.3 AI Integration
- [x] AWS Bedrock (Claude 3.5 Sonnet)
- [x] Feedback generation (constructive, age-appropriate)
- [x] Progressive hints (easy/medium/hard)
- [x] Concept explanation (age-appropriate)
- [x] Response analysis (key points scoring)
- [x] Content moderation (K-12 safety)
- [x] Auto-quarantine system
- [x] AI usage tracking (tokens, costs)

### 4.4 Activity Evaluation
- [x] SELECT: Multiple choice with partial credit
- [x] MATCH: Pair matching with partial credit
- [x] SEQUENCE: Ordering with positional scoring
- [x] CODE: Keyword-based validation (no sandbox yet)
- [x] EXPLAIN: Key point mention detection
- [x] CREATE: Completion-based scoring
- [x] SOLVE: Normalized answer comparison

### 4.5 Gamification (Separate from Mastery)
- [x] XP with duplicate prevention
- [x] Level calculation (progressive curve)
- [x] Coins (earn/spend)
- [x] Practice streaks
- [x] Achievements (milestone-based, dynamically calculated)
- [x] Leaderboard (opt-in, ranked by XP)

### 4.6 Safety & Moderation
- [x] AI-powered content moderation
- [x] Category detection (violence, PII, bullying, etc.)
- [x] Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- [x] Auto-quarantine for flagged content
- [x] Moderator review workflow
- [x] Moderation statistics

### 4.7 Parent System
- [x] Guardian-learner relationships with consent
- [x] Child dashboard (progress, mastery, streak)
- [x] Learning progress reports
- [x] Activity log (by days)
- [x] Time limits (daily/weekly/bedtime)
- [x] Family summary

---

## 5. ARCHITECTURAL STRENGTHS

1. **Mastery ≠ Gamification** - The system correctly separates learning mastery (evidence-based confidence) from gamification (XP, badges). XP does NOT determine mastery.
2. **Evidence-Based System** - 8 evidence types, weighted by recency, diversity, and spacing.
3. **Async Processing** - Mastery recalculation via Bull queue (non-blocking).
4. **Safety-First** - Content moderation is architectural, not bolted on.
5. **Adaptive Difficulty** - ZPD-based, not fixed progression.

---

## 6. SYSTEM MAP

```
USER
 ↓
LEARNER IDENTITY (User, Learner, AgeBand, Preferences)
 ↓
LEARNER MODEL (Progression, MasteryRecord[], PracticeStreak)
 ↓
CHARACTER / COMPANION (Character model exists, behavior NOT implemented)
 ↓
LEARNING PROFILE (ageBand, interests, motivationDrivers - in src/ types only)
 ↓
LEARNING GRAPH (Domain → Skill → Competency → Objective → Activity)
 ↓
CURRICULUM (exists as data model, NO prerequisite relationships yet)
 ↓
SKILLS (8 seeded via seed-full.js)
 ↓
COMPETENCIES (11 seeded)
 ↓
OBJECTIVES (11 seeded)
 ↓
MISSIONS (8 missions, 4 types)
 ↓
ACTIVITIES (25 activities, 7 types)
 ↓
PRACTICE (review scheduling exists in mastery algorithm)
 ↓
PROJECTS (CRUD exists, NO milestone/rubric/assessment)
 ↓
ASSESSMENTS (NO dedicated assessment engine)
 ↓
MASTERY (IMPLEMENTED - FSRS algorithm, 7 states)
 ↓
REVIEW (reviewDue scheduling exists)
 ↓
RECOMMENDATION (IMPLEMENTED - 4 types)
 ↓
NEXT EXPERIENCE (ZPD → difficulty → activity selection)
```

---

## 7. TECHNOLOGY STACK EVALUATION

| Component | Current | Fit | Notes |
|-----------|---------|-----|-------|
| NestJS 10 | Installed | EXCELLENT | Module system matches educational domain boundaries |
| PostgreSQL 16 | Deployed | EXCELLENT | Relational model suits curriculum graph |
| Prisma 5.7 | Installed | GOOD | Strong typing, but no graph queries natively |
| Redis + Bull | Deployed | GOOD | Async mastery recalculation |
| AWS Bedrock | Configured | GOOD | Claude 3.5 Sonnet for all AI tasks |
| JWT Auth | Implemented | GOOD | Standard, works for MVP |
| Helmet + CORS | Configured | GOOD | Security headers |
| class-validator | Installed | GOOD | DTO validation |

---

## 8. CRITICAL ARCHITECTURAL DECISIONS

### Decision 1: Prerequisite System
**Status:** NOT IMPLEMENTED
**Required:** The `src/` frontend types define `prerequisiteIds` on CurriculumNode. The backend schema has NO prerequisite table or relationship.
**Resolution:** Add a `Prerequisite` model (or self-referential relation on Competency/Skill).

### Decision 2: Age Adaptation
**Status:** SCHEMA ONLY (ageBand enum exists)
**Required:** The `src/` types define `AgeVariant` with framing, challenge, surface, supportLevel per age.
**Resolution:** Add age-variant content structure to activities and objectives.

### Decision 3: Learning Graph vs Flat Hierarchy
**Status:** Current schema is a strict tree (Domain → Skill → Competency → Objective → Activity)
**Required:** The `src/` types expect a GRAPH with cross-links (relatedIds, prerequisiteIds, alternativeIds)
**Resolution:** Add relationship tables for graph edges without breaking the existing tree.

### Decision 4: Content Language
**Status:** No i18n support in backend
**Required:** Arabic + Egyptian Arabic + English support
**Resolution:** Add translatable content fields (JSON or separate translation table).

### Decision 5: Character Behavior
**Status:** Character model exists (name, role, personality, systemPrompt). No behavior engine.
**Required:** Characters must contextually interact with learning state.
**Resolution:** Create character context service that composes learner state + mission state + mastery state into AI prompts.

### Decision 6: Code Execution
**Status:** CODE activity type exists but only does keyword matching
**Required:** Safe sandboxed code execution for children
**Resolution:** Design sandbox adapter interface. Defer implementation to future phase. Current keyword check is acceptable MVP.
