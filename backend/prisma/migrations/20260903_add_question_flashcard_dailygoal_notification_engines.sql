-- Question Engine, Flashcard Engine, Daily Learning Engine, Notification Engine
-- (missing-wave2-cluster-1) — 4 new independent feature stacks, all previously
-- Missing per the gap matrix.

-- ===== Question Engine =====
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'FILL_BLANK', 'DRAG_DROP');

CREATE TABLE "question_templates" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "stem" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "distractors" JSONB NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "question_templates_objectiveId_idx" ON "question_templates"("objectiveId");
CREATE INDEX "question_templates_type_idx" ON "question_templates"("type");

ALTER TABLE "question_templates" ADD CONSTRAINT "question_templates_objectiveId_fkey"
  FOREIGN KEY ("objectiveId") REFERENCES "learning_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activities" ADD COLUMN "generatedFromTemplateId" TEXT;
CREATE INDEX "activities_generatedFromTemplateId_idx" ON "activities"("generatedFromTemplateId");
ALTER TABLE "activities" ADD CONSTRAINT "activities_generatedFromTemplateId_fkey"
  FOREIGN KEY ("generatedFromTemplateId") REFERENCES "question_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===== Flashcard Engine =====
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "flashcards_domainId_idx" ON "flashcards"("domainId");
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_domainId_fkey"
  FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "flashcard_reviews" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "flashcard_reviews_learnerId_flashcardId_key" ON "flashcard_reviews"("learnerId", "flashcardId");
CREATE INDEX "flashcard_reviews_learnerId_idx" ON "flashcard_reviews"("learnerId");
CREATE INDEX "flashcard_reviews_nextReviewDue_idx" ON "flashcard_reviews"("nextReviewDue");

ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_learnerId_fkey"
  FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_flashcardId_fkey"
  FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Daily Learning Engine =====
CREATE TABLE "daily_goals" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "targetMinutes" INTEGER NOT NULL DEFAULT 15,
    "targetActivities" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_goals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_goals_learnerId_key" ON "daily_goals"("learnerId");
ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_learnerId_fkey"
  FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Notification Engine =====
CREATE TYPE "NotificationType" AS ENUM ('STREAK_AT_RISK', 'CHARACTER_UNLOCKED', 'DAILY_GOAL_COMPLETE', 'MISSION_REMINDER', 'ACHIEVEMENT_UNLOCKED');

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_learnerId_idx" ON "notifications"("learnerId");
CREATE INDEX "notifications_learnerId_isRead_idx" ON "notifications"("learnerId", "isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_learnerId_fkey"
  FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
