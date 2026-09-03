-- Metacognition Engine: zero-trace engine per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b ("No model, no service, no seed,
-- no frontend trace anywhere. Missing."). Built from scratch: a small bank
-- of reusable reflection prompts ("How did that feel?" / "What was
-- tricky?") plus a per-learner, per-mission-run response log storing
-- self-ratings (1-5 scale) and optional free-text notes.

CREATE TYPE "ReflectionPromptKind" AS ENUM ('FEELING', 'DIFFICULTY', 'STRATEGY');

CREATE TABLE "reflection_prompts" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "kind" "ReflectionPromptKind" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_prompts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reflection_prompts_kind_idx" ON "reflection_prompts"("kind");

CREATE TABLE "mission_reflections" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "missionRunId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_reflections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mission_reflections_learnerId_idx" ON "mission_reflections"("learnerId");
CREATE INDEX "mission_reflections_missionRunId_idx" ON "mission_reflections"("missionRunId");

ALTER TABLE "mission_reflections" ADD CONSTRAINT "mission_reflections_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mission_reflections" ADD CONSTRAINT "mission_reflections_missionRunId_fkey"
    FOREIGN KEY ("missionRunId") REFERENCES "mission_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mission_reflections" ADD CONSTRAINT "mission_reflections_promptId_fkey"
    FOREIGN KEY ("promptId") REFERENCES "reflection_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
