-- Assessment Engine gap fix: diagnostic/formative/summative typing on
-- Activity (the thing actually assessed via ActivityAttempt).

CREATE TYPE "AssessmentPurpose" AS ENUM ('DIAGNOSTIC', 'FORMATIVE', 'SUMMATIVE');

ALTER TABLE "activities"
  ADD COLUMN "assessmentPurpose" "AssessmentPurpose" NOT NULL DEFAULT 'FORMATIVE';

CREATE INDEX "activities_assessmentPurpose_idx" ON "activities"("assessmentPurpose");
