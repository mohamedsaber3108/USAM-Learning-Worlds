-- ============================================
-- PHASE 4: LEARNING & CONTENT ENGINE FOUNDATION
-- Date: 2026-08-13
-- ============================================

-- PART 1: Complete Phase 3 (add missing Phase 3 models)
-- Already handled by add_phase3_ai_tables.sql, just need to ensure tables exist

-- PART 2: Add Concept Layer (between Competency and LearningObjective)
-- ============================================

CREATE TABLE "concepts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "competencyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "concepts_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE
);

CREATE INDEX "concepts_competencyId_idx" ON "concepts"("competencyId");
CREATE INDEX "concepts_slug_idx" ON "concepts"("slug");

-- Add conceptId to learning_objectives (optional - objectives can be at competency or concept level)
ALTER TABLE "learning_objectives" ADD COLUMN "conceptId" TEXT;
ALTER TABLE "learning_objectives" ADD CONSTRAINT "learning_objectives_conceptId_fkey"
  FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE;
CREATE INDEX "learning_objectives_conceptId_idx" ON "learning_objectives"("conceptId");

-- PART 3: Add Prerequisite System
-- ============================================

CREATE TYPE "PrerequisiteType" AS ENUM (
  'REQUIRED',
  'RECOMMENDED',
  'COREQUISITE'
);

CREATE TABLE "concept_prerequisites" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "conceptId" TEXT NOT NULL,
  "prerequisiteId" TEXT NOT NULL,
  "type" "PrerequisiteType" NOT NULL DEFAULT 'REQUIRED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "concept_prerequisites_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE,
  CONSTRAINT "concept_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "concepts"("id") ON DELETE CASCADE,
  CONSTRAINT "concept_prerequisites_conceptId_prerequisiteId_key" UNIQUE ("conceptId", "prerequisiteId")
);

CREATE INDEX "concept_prerequisites_conceptId_idx" ON "concept_prerequisites"("conceptId");
CREATE INDEX "concept_prerequisites_prerequisiteId_idx" ON "concept_prerequisites"("prerequisiteId");

-- Competency-level prerequisites (for high-level dependencies)
CREATE TABLE "competency_prerequisites" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "competencyId" TEXT NOT NULL,
  "prerequisiteId" TEXT NOT NULL,
  "type" "PrerequisiteType" NOT NULL DEFAULT 'REQUIRED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competency_prerequisites_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE,
  CONSTRAINT "competency_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "competencies"("id") ON DELETE CASCADE,
  CONSTRAINT "competency_prerequisites_competencyId_prerequisiteId_key" UNIQUE ("competencyId", "prerequisiteId")
);

CREATE INDEX "competency_prerequisites_competencyId_idx" ON "competency_prerequisites"("competencyId");
CREATE INDEX "competency_prerequisites_prerequisiteId_idx" ON "competency_prerequisites"("prerequisiteId");

-- PART 4: Add Learning Paths
-- ============================================

CREATE TABLE "learning_paths" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "domainId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "ageBand" "AgeBand",
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "learning_paths_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE
);

CREATE INDEX "learning_paths_domainId_idx" ON "learning_paths"("domainId");
CREATE INDEX "learning_paths_slug_idx" ON "learning_paths"("slug");

CREATE TABLE "learning_path_nodes" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "pathId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL, -- 'SKILL', 'CONCEPT', 'MISSION'
  "entityId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isOptional" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "learning_path_nodes_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE
);

CREATE INDEX "learning_path_nodes_pathId_idx" ON "learning_path_nodes"("pathId");
CREATE INDEX "learning_path_nodes_entityType_entityId_idx" ON "learning_path_nodes"("entityType", "entityId");

-- Learner progress through paths
CREATE TABLE "learning_path_progress" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" TEXT NOT NULL,
  "pathId" TEXT NOT NULL,
  "currentNodeIndex" INTEGER NOT NULL DEFAULT 0,
  "completedNodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "learning_path_progress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE,
  CONSTRAINT "learning_path_progress_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE,
  CONSTRAINT "learning_path_progress_learnerId_pathId_key" UNIQUE ("learnerId", "pathId")
);

CREATE INDEX "learning_path_progress_learnerId_idx" ON "learning_path_progress"("learnerId");
CREATE INDEX "learning_path_progress_pathId_idx" ON "learning_path_progress"("pathId");

-- PART 5: Fix Mission-Activity Linkage (CRITICAL FIX)
-- ============================================

CREATE TABLE "mission_activities" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "missionId" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isRequired" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "mission_activities_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE,
  CONSTRAINT "mission_activities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE,
  CONSTRAINT "mission_activities_missionId_activityId_key" UNIQUE ("missionId", "activityId")
);

CREATE INDEX "mission_activities_missionId_idx" ON "mission_activities"("missionId");
CREATE INDEX "mission_activities_activityId_idx" ON "mission_activities"("activityId");

-- PART 6: Age Adaptation System
-- ============================================

CREATE TYPE "ScaffoldLevel" AS ENUM (
  'MODELLED',
  'GUIDED',
  'COACHED',
  'INDEPENDENT'
);

CREATE TABLE "age_variants" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "entityType" TEXT NOT NULL, -- 'ACTIVITY', 'OBJECTIVE', 'MISSION', etc
  "entityId" TEXT NOT NULL,
  "ageBand" "AgeBand" NOT NULL,
  "framing" TEXT NOT NULL, -- Age-appropriate framing/presentation
  "languageLevel" TEXT, -- 'simple', 'moderate', 'complex'
  "scaffoldLevel" "ScaffoldLevel" NOT NULL DEFAULT 'GUIDED',
  "surface" TEXT, -- 'visual', 'blocks', 'text'
  "content" JSONB, -- Age-specific content overrides
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "age_variants_entityType_entityId_ageBand_key" UNIQUE ("entityType", "entityId", "ageBand")
);

CREATE INDEX "age_variants_entityType_entityId_idx" ON "age_variants"("entityType", "entityId");
CREATE INDEX "age_variants_ageBand_idx" ON "age_variants"("ageBand");

-- PART 7: Content Management & Validation
-- ============================================

CREATE TYPE "ContentType" AS ENUM (
  'ACTIVITY',
  'QUESTION',
  'STORY',
  'SCENARIO',
  'HINT',
  'EXPLANATION',
  'PROJECT_BRIEF',
  'PRACTICE_SET'
);

CREATE TYPE "ContentStatus" AS ENUM (
  'DRAFT',
  'VALIDATING',
  'VALIDATED',
  'PUBLISHED',
  'DEPRECATED',
  'REJECTED'
);

CREATE TABLE "content_items" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" "ContentType" NOT NULL,
  "title" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "metadata" JSONB,
  "language" TEXT NOT NULL DEFAULT 'en',
  "ageBand" "AgeBand",
  "domainId" TEXT,
  "objectiveId" TEXT,
  "difficulty" "DifficultyLevel",
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "version" INTEGER NOT NULL DEFAULT 1,
  "generatedBy" TEXT, -- 'AI' or userId
  "validatedBy" TEXT,
  "validatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "content_items_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE SET NULL,
  CONSTRAINT "content_items_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "learning_objectives"("id") ON DELETE SET NULL
);

CREATE INDEX "content_items_type_idx" ON "content_items"("type");
CREATE INDEX "content_items_status_idx" ON "content_items"("status");
CREATE INDEX "content_items_domainId_idx" ON "content_items"("domainId");
CREATE INDEX "content_items_ageBand_idx" ON "content_items"("ageBand");
CREATE INDEX "content_items_generatedBy_idx" ON "content_items"("generatedBy");

-- PART 8: Multilingual Support
-- ============================================

CREATE TABLE "translations" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "entityType" TEXT NOT NULL, -- 'DOMAIN', 'SKILL', 'ACTIVITY', etc
  "entityId" TEXT NOT NULL,
  "field" TEXT NOT NULL, -- 'name', 'description', 'title', 'content'
  "language" TEXT NOT NULL, -- 'en', 'ar', 'ar-EG'
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "translations_entityType_entityId_field_language_key" UNIQUE ("entityType", "entityId", "field", "language")
);

CREATE INDEX "translations_entityType_entityId_idx" ON "translations"("entityType", "entityId");
CREATE INDEX "translations_language_idx" ON "translations"("language");

-- PART 9: Learning Events & Analytics
-- ============================================

CREATE TYPE "LearningEventType" AS ENUM (
  'ACTIVITY_STARTED',
  'ACTIVITY_COMPLETED',
  'ANSWER_SUBMITTED',
  'HINT_REQUESTED',
  'EXPLANATION_REQUESTED',
  'MASTERY_CHANGED',
  'PROJECT_STARTED',
  'PROJECT_COMPLETED',
  'MISSION_STARTED',
  'MISSION_COMPLETED',
  'CONVERSATION_STARTED',
  'SKILL_UNLOCKED',
  'CONCEPT_UNLOCKED',
  'ACHIEVEMENT_EARNED',
  'PRACTICE_STREAK_UPDATED',
  'REVIEW_SCHEDULED',
  'ASSESSMENT_STARTED',
  'ASSESSMENT_COMPLETED'
);

CREATE TABLE "learning_events" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" TEXT NOT NULL,
  "type" "LearningEventType" NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "data" JSONB,
  "sessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "learning_events_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE
);

CREATE INDEX "learning_events_learnerId_idx" ON "learning_events"("learnerId");
CREATE INDEX "learning_events_type_idx" ON "learning_events"("type");
CREATE INDEX "learning_events_createdAt_idx" ON "learning_events"("createdAt");
CREATE INDEX "learning_events_sessionId_idx" ON "learning_events"("sessionId");
CREATE INDEX "learning_events_entityType_entityId_idx" ON "learning_events"("entityType", "entityId");

-- PART 10: Project Enhancements (Milestones & Rubrics)
-- ============================================

CREATE TABLE "project_milestones" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "targetDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, SKIPPED
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "project_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);

CREATE INDEX "project_milestones_projectId_idx" ON "project_milestones"("projectId");
CREATE INDEX "project_milestones_status_idx" ON "project_milestones"("status");

CREATE TABLE "rubrics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "entityType" TEXT NOT NULL, -- 'PROJECT', 'ACTIVITY', 'ASSESSMENT'
  "entityId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "rubrics_entityType_entityId_idx" ON "rubrics"("entityType", "entityId");

CREATE TABLE "rubric_criteria" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "rubricId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "levels" JSONB NOT NULL, -- [{level, description, score}]
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubrics"("id") ON DELETE CASCADE
);

CREATE INDEX "rubric_criteria_rubricId_idx" ON "rubric_criteria"("rubricId");

-- PART 11: Domain-Specific Structures
-- ============================================

-- English Learning Strands
CREATE TABLE "english_strands" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "cefrLevel" TEXT, -- A1, A2, B1, B2
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "english_strands_slug_idx" ON "english_strands"("slug");

-- Coding Concepts (18 core concepts)
CREATE TABLE "coding_concepts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category" TEXT NOT NULL, -- 'BASICS', 'LOGIC', 'DATA', 'ALGORITHMS', 'DESIGN'
  "difficulty" INTEGER NOT NULL DEFAULT 1, -- 1-5
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "coding_concepts_slug_idx" ON "coding_concepts"("slug");
CREATE INDEX "coding_concepts_category_idx" ON "coding_concepts"("category");

-- AI Literacy Concepts
CREATE TABLE "ai_literacy_concepts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "ageAppropriate" "AgeBand" NOT NULL, -- Minimum age band
  "category" TEXT NOT NULL, -- 'BASICS', 'ETHICS', 'APPLICATIONS', 'FUTURE'
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ai_literacy_concepts_slug_idx" ON "ai_literacy_concepts"("slug");
CREATE INDEX "ai_literacy_concepts_ageAppropriate_idx" ON "ai_literacy_concepts"("ageAppropriate");

-- Entrepreneurship Concepts
CREATE TABLE "entrepreneurship_concepts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category" TEXT NOT NULL, -- 'MINDSET', 'BUSINESS_BASICS', 'FINANCE', 'MARKETING', 'INNOVATION'
  "ageAppropriate" "AgeBand" NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "entrepreneurship_concepts_slug_idx" ON "entrepreneurship_concepts"("slug");
CREATE INDEX "entrepreneurship_concepts_category_idx" ON "entrepreneurship_concepts"("category");

-- Financial Literacy Concepts
CREATE TABLE "financial_literacy_concepts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category" TEXT NOT NULL, -- 'MONEY_BASICS', 'SAVING', 'EARNING', 'SPENDING', 'INVESTING'
  "ageAppropriate" "AgeBand" NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "financial_literacy_concepts_slug_idx" ON "financial_literacy_concepts"("slug");
CREATE INDEX "financial_literacy_concepts_category_idx" ON "financial_literacy_concepts"("category");
