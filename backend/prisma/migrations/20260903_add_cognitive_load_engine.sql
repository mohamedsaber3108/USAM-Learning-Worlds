-- Cognitive Load Engine v1: track per-attempt pacing/fatigue signals
-- (hint usage, time-on-task, pauses) distinct from the ZPD Calculator's
-- mastery-based difficulty targeting. One row per activity attempt
-- submission (see backend/src/modules/adaptive/cognitive-load.service.ts
-- recordSignal(), called from MissionsService.submitActivity()).

CREATE TABLE "cognitive_load_signals" (
    "id"                TEXT NOT NULL,
    "learnerId"         TEXT NOT NULL,
    "activityId"        TEXT NOT NULL,
    "missionRunId"      TEXT,
    "attemptId"         TEXT,
    "hintCount"         INTEGER NOT NULL DEFAULT 0,
    "timeOnTaskSeconds" INTEGER NOT NULL DEFAULT 0,
    "pauseCount"        INTEGER NOT NULL DEFAULT 0,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cognitive_load_signals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cognitive_load_signals_learnerId_idx" ON "cognitive_load_signals"("learnerId");
CREATE INDEX "cognitive_load_signals_activityId_idx" ON "cognitive_load_signals"("activityId");
CREATE INDEX "cognitive_load_signals_missionRunId_idx" ON "cognitive_load_signals"("missionRunId");
CREATE INDEX "cognitive_load_signals_createdAt_idx" ON "cognitive_load_signals"("createdAt");

ALTER TABLE "cognitive_load_signals" ADD CONSTRAINT "cognitive_load_signals_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cognitive_load_signals" ADD CONSTRAINT "cognitive_load_signals_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cognitive_load_signals" ADD CONSTRAINT "cognitive_load_signals_missionRunId_fkey"
    FOREIGN KEY ("missionRunId") REFERENCES "mission_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cognitive_load_signals" ADD CONSTRAINT "cognitive_load_signals_attemptId_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "activity_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
