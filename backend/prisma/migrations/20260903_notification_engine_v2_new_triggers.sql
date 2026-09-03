-- Notification Engine v2: add MISSION_MILESTONE and PARENT_FLAG values to
-- the existing NotificationType enum (Notification model/table itself
-- already exists from 20260903_add_question_flashcard_dailygoal_notification_engines.sql
-- and was confirmed present via grep before this change — this migration
-- only extends the enum so two NEW real event triggers can be wired:
--   1. MISSION_MILESTONE — fired from MissionsService.completeMission()
--      when a learner crosses a mission-count milestone (1/5/10/25/50).
--   2. PARENT_FLAG — fired from InterventionService.createIfNotOpen()
--      to notify each linked guardian when a new intervention
--      recommendation is opened for their child (a real
--      parent-dashboard-relevant flag, not a stub).

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MISSION_MILESTONE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PARENT_FLAG';
