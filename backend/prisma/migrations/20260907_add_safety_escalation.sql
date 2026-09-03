-- agent-backend-teacher-escalation-v2: SafetyEscalation model.
--
-- Verified gap: CharacterSafetyService.evaluateSafety() (see
-- backend/src/modules/ai/services/character-safety.service.ts) resolves
-- HIGH-severity character-safety events to the 'escalation_required'
-- SafetyState, but logSafetyEvent() only ever wrote that verdict into
-- the generic ModerationLog's free-form fields (categories/contentPreview
-- JSON blob) - there was no dedicated escalation record, no assignee,
-- no status, no resolution workflow. A HIGH-severity safety flag on a
-- children's platform had nowhere real for a human moderator to act on
-- it. This migration adds the first-class queue.
--
-- Hand-written raw-SQL migration (not `prisma migrate dev`), following
-- this repo's established convention for agents without live-DB access
-- (see add_phase3_ai_tables.sql / 20260906_add_media_simulation_*.sql) -
-- avoids risking the tracked-migration history.

CREATE TYPE "SafetyEscalationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE "safety_escalations" (
    "id"            TEXT NOT NULL,
    "learnerId"     TEXT NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "safetyState"   TEXT NOT NULL,
    "status"        "SafetyEscalationStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo"    TEXT,
    "resolvedAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_escalations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "safety_escalations_status_idx" ON "safety_escalations"("status");
CREATE INDEX "safety_escalations_learnerId_idx" ON "safety_escalations"("learnerId");
CREATE INDEX "safety_escalations_createdAt_idx" ON "safety_escalations"("createdAt");

ALTER TABLE "safety_escalations"
  ADD CONSTRAINT "safety_escalations_learnerId_fkey"
  FOREIGN KEY ("learnerId") REFERENCES "learners"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
