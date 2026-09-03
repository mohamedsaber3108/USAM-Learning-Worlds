-- Teacher/Mentor Engine v1 (human escalation layer) — previously fully
-- Missing per the Gap Matrix Infra/Platform section ("no human-teacher
-- escalation layer exists in any form... only 'mentor' concept in the
-- codebase is an AI character personality label"). This migration adds
-- the real human-decision fields to the existing SafetyEscalation queue
-- so RESOLVED always carries an actual audit trail (what a human
-- decided, and why) rather than just a status flip with no record of
-- the outcome.
--
-- Hand-written raw-SQL migration (not `prisma migrate dev`), following
-- this repo's established convention (see 20260907_add_safety_escalation.sql).

CREATE TYPE "EscalationResolutionType" AS ENUM (
  'RESOLVED_INTERNALLY',
  'REFERRED_TO_GUARDIAN',
  'REFERRED_TO_HUMAN_SUPPORT',
  'FALSE_POSITIVE'
);

ALTER TABLE "safety_escalations"
  ADD COLUMN "resolutionType" "EscalationResolutionType",
  ADD COLUMN "resolutionNote" TEXT;
