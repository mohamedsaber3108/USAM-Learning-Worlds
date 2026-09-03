-- Difficulty Calibration Engine v1: DifficultyCalibrationFlag.
-- Verified this pass that "Evaluation Engine" (Infra/Platform section of
-- the gap matrix) is a genuine naming duplicate of "AI Evaluation Harness"
-- (already built, ai-eval.service.ts + AdminAIEvalPage.tsx) -- both name
-- the same missing capability (AI-output text scoring), so no duplicate
-- system was built for that gap.
--
-- Instead this migration adds the genuinely distinct real gap found while
-- checking the same family: NOTHING in the codebase compared authored
-- Activity.difficulty (DifficultyLevel enum) against the EMPIRICAL success
-- rate real learners achieve on that activity (ActivityAttempt.success).
-- Assessment Quality Engine only checks static item structure (broken
-- options/answer keys); Content QA only checks completeness; neither reads
-- ActivityAttempt at all. This closes that gap with a v1 flag table backing
-- difficulty-calibration.service.ts's scanAndPersist().
--
-- NOTE: written as raw SQL per repo convention (see prisma/migrations/*.sql
-- for prior examples) - this file is NOT applied by this agent. The
-- coordinator applies it centrally to avoid uncoordinated migrations against
-- the shared/prod database.

CREATE TABLE "difficulty_calibration_flags" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "flagType" TEXT NOT NULL,
    "authoredDifficulty" TEXT NOT NULL,
    "empiricalSuccessRate" DOUBLE PRECISION NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "detail" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "difficulty_calibration_flags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "difficulty_calibration_flags_activityId_idx" ON "difficulty_calibration_flags"("activityId");
CREATE INDEX "difficulty_calibration_flags_flagType_idx" ON "difficulty_calibration_flags"("flagType");
CREATE INDEX "difficulty_calibration_flags_resolvedAt_idx" ON "difficulty_calibration_flags"("resolvedAt");

ALTER TABLE "difficulty_calibration_flags" ADD CONSTRAINT "difficulty_calibration_flags_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
