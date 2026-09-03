-- Assessment Quality Engine v1 — structural review of SELECT/MATCH/
-- SEQUENCE question items. Apply manually via psql on the live Kids-
-- server DB (same pattern as sibling manual migrations in this dir).

CREATE TABLE "assessment_quality_flags" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "flagType" TEXT NOT NULL,
  "detail" TEXT,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "assessment_quality_flags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "assessment_quality_flags_activityId_idx" ON "assessment_quality_flags"("activityId");
CREATE INDEX "assessment_quality_flags_flagType_idx" ON "assessment_quality_flags"("flagType");
CREATE INDEX "assessment_quality_flags_resolvedAt_idx" ON "assessment_quality_flags"("resolvedAt");

ALTER TABLE "assessment_quality_flags" ADD CONSTRAINT "assessment_quality_flags_activityId_fkey"
  FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
