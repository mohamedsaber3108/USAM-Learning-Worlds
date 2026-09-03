-- Intervention Engine v1 — reactive "learner is stuck" detection.
-- Applied manually via psql on the live Kids-server DB (same pattern as
-- prior manual migrations in this file's sibling scripts — no separate
-- control-server DB exists, Kids-server DB is the only one).

CREATE TYPE "InterventionStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE "InterventionTrigger" AS ENUM ('CONSECUTIVE_WRONG_SAME_COMPETENCY', 'LOW_MASTERY_REPEATED_ATTEMPTS');

CREATE TABLE "intervention_recommendations" (
  "id" TEXT NOT NULL,
  "learnerId" TEXT NOT NULL,
  "competencyId" TEXT NOT NULL,
  "triggerType" "InterventionTrigger" NOT NULL,
  "triggerDetail" TEXT NOT NULL,
  "recommendedAction" TEXT NOT NULL,
  "status" "InterventionStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledgedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "intervention_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "intervention_recommendations_learnerId_idx" ON "intervention_recommendations"("learnerId");
CREATE INDEX "intervention_recommendations_competencyId_idx" ON "intervention_recommendations"("competencyId");
CREATE INDEX "intervention_recommendations_status_idx" ON "intervention_recommendations"("status");

ALTER TABLE "intervention_recommendations" ADD CONSTRAINT "intervention_recommendations_learnerId_fkey"
  FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intervention_recommendations" ADD CONSTRAINT "intervention_recommendations_competencyId_fkey"
  FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
