-- Audit 71 (follow-up) — close the schema/DB drift surfaced live by
-- `npm run check:enum-drift` + `npm run check:migrations` after the coding deploy.
--
-- Several earlier migrations were NON-idempotent (bare CREATE TYPE / ADD COLUMN)
-- and were never applied to prod, and the Intervention Engine had NO migration
-- file at all (only in schema.prisma). Result (found live, not in prod yet used
-- on the hot path): 3 missing enum types, 2 missing enum VALUES, and 11 missing
-- columns. This migration re-declares ALL of them, fully guarded, so it is safe
-- to run on a DB in any partial state and safe to re-run.
--
-- Enum types missing:      InterventionTrigger, InterventionStatus, EscalationResolutionType
-- Enum values missing:     CharacterRole += DIGITAL_GUARDIAN;
--                          ConversationType += DEBATE, INTERVIEW
-- Columns missing:         flashcard_reviews.{stability,difficulty,fsrsState,reps,
--                            lapses,elapsedDays,scheduledDays}
--                          projects.{domainIds,isCrossDomain}
--                          safety_escalations.{resolutionType,resolutionNote}
-- Table missing:           intervention_recommendations (+ its indexes)

-- ---------- Enum types (guarded CREATE TYPE) ----------
DO $$ BEGIN
  CREATE TYPE "InterventionTrigger" AS ENUM (
    'CONSECUTIVE_WRONG_SAME_COMPETENCY','LOW_MASTERY_REPEATED_ATTEMPTS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InterventionStatus" AS ENUM ('OPEN','ACKNOWLEDGED','RESOLVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EscalationResolutionType" AS ENUM (
    'RESOLVED_INTERNALLY','REFERRED_TO_GUARDIAN','REFERRED_TO_HUMAN_SUPPORT','FALSE_POSITIVE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Enum value additions (idempotent) ----------
ALTER TYPE "CharacterRole"   ADD VALUE IF NOT EXISTS 'DIGITAL_GUARDIAN';
ALTER TYPE "ConversationType" ADD VALUE IF NOT EXISTS 'DEBATE';
ALTER TYPE "ConversationType" ADD VALUE IF NOT EXISTS 'INTERVIEW';

-- ---------- intervention_recommendations table ----------
CREATE TABLE IF NOT EXISTS "intervention_recommendations" (
  "id"                TEXT PRIMARY KEY,
  "learnerId"         TEXT NOT NULL,
  "competencyId"      TEXT NOT NULL,
  "triggerType"       "InterventionTrigger" NOT NULL,
  "triggerDetail"     TEXT NOT NULL,
  "recommendedAction" TEXT NOT NULL,
  "status"            "InterventionStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledgedAt"    TIMESTAMP(3),
  "resolvedAt"        TIMESTAMP(3),
  CONSTRAINT "intervention_recommendations_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE,
  CONSTRAINT "intervention_recommendations_competencyId_fkey"
    FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "intervention_recommendations_learnerId_idx" ON "intervention_recommendations"("learnerId");
CREATE INDEX IF NOT EXISTS "intervention_recommendations_competencyId_idx" ON "intervention_recommendations"("competencyId");
CREATE INDEX IF NOT EXISTS "intervention_recommendations_status_idx" ON "intervention_recommendations"("status");

-- ---------- safety_escalations resolution columns ----------
ALTER TABLE "safety_escalations" ADD COLUMN IF NOT EXISTS "resolutionType" "EscalationResolutionType";
ALTER TABLE "safety_escalations" ADD COLUMN IF NOT EXISTS "resolutionNote" TEXT;

-- ---------- flashcard_reviews FSRS state columns ----------
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "stability"     DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "difficulty"    DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "fsrsState"     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "reps"          INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "lapses"        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "elapsedDays"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "scheduledDays" INTEGER NOT NULL DEFAULT 0;

-- ---------- projects cross-domain columns ----------
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "domainIds"     TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isCrossDomain" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "projects_isCrossDomain_idx" ON "projects"("isCrossDomain");
