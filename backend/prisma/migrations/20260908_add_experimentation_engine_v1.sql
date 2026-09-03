-- agent-backend-experimentation-engine-v1: Experimentation Engine v1.
-- Per USAM_KIDS_ENGINE_GAP_MATRIX.md "Experimentation Engine" row (zero
-- trace — no A/B-test framework, no experiment-assignment logic, no
-- feature-flag-gated variant serving anywhere). Checked the existing
-- `feature_flags` table first (Feature Flag Engine row, "Already
-- implemented (v1)"): it is a simple global on/off + per-learner
-- allow-list model (FeatureFlagService.isEnabled()), with NO %-rollout/
-- bucketing and NO assignment persistence — confirmed by reading
-- backend/src/modules/feature-flags/*.ts and the FeatureFlag model in
-- schema.prisma. This migration adds a separate, purpose-built
-- Experiment / ExperimentAssignment pair alongside it rather than
-- overloading FeatureFlag with concerns it wasn't designed for.
--
-- Outcome measurement is explicitly NOT part of this migration. Per the
-- inventory's own caveat ("A/B test learning outcomes, not just
-- engagement"), experiment results should be computed by joining
-- ExperimentAssignment.learnerId/variant against the existing
-- learning_events table, not by adding new metric columns/tables here.
--
-- Hand-written raw-SQL migration, following this repo's established
-- convention (see e.g. 20260907_add_safety_policy_engine.sql) since
-- agents in this project have no live-DB access and must not risk
-- clobbering the tracked-migration history via `prisma migrate dev`.

CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED');

CREATE TABLE "experiments" (
    "id"          TEXT NOT NULL,
    "key"         TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "variants"    JSONB NOT NULL,
    "status"      "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "experiments_key_key" ON "experiments"("key");
CREATE INDEX "experiments_key_idx" ON "experiments"("key");

CREATE TABLE "experiment_assignments" (
    "id"           TEXT NOT NULL,
    "learnerId"    TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "variant"      TEXT NOT NULL,
    "assignedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiment_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "experiment_assignments_learnerId_experimentId_key"
    ON "experiment_assignments"("learnerId", "experimentId");
CREATE INDEX "experiment_assignments_experimentId_idx" ON "experiment_assignments"("experimentId");
CREATE INDEX "experiment_assignments_learnerId_idx" ON "experiment_assignments"("learnerId");

ALTER TABLE "experiment_assignments"
    ADD CONSTRAINT "experiment_assignments_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experiment_assignments"
    ADD CONSTRAINT "experiment_assignments_experimentId_fkey"
    FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
