-- AI Memory Governance v1 (agent-ai-memory-governance): the platform
-- persists ConversationMessage/CharacterInteraction rows indefinitely
-- today with no purpose/classification metadata attached to the
-- retentionDays field added in 20260903_add_prompt_templates_and_
-- retention_policy.sql. This migration adds a `purposeTag` column so a
-- purge job (and admin visibility endpoint) can reason about *why* a
-- record was kept, not just *how long*, plus an explicit
-- `createdForRetention` timestamp snapshot (defaults to now() on
-- write, distinct from `createdAt`/`generatedAt` so retention math
-- never has to worry about a future rename of those columns breaking
-- it) per docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
-- "AI Memory Governance" row.
--
-- Applied directly via psql on the live DB per this repo's established
-- convention for raw-SQL migrations (see Part 5b of
-- docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md). This file is
-- additive-only: no column is dropped or renamed.

ALTER TABLE "conversation_messages" ADD COLUMN IF NOT EXISTS "purposeTag" TEXT NOT NULL DEFAULT 'LEARNING_INTERACTION';
ALTER TABLE "conversation_messages" ADD COLUMN IF NOT EXISTS "createdForRetention" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "character_interactions" ADD COLUMN IF NOT EXISTS "purposeTag" TEXT NOT NULL DEFAULT 'LEARNING_INTERACTION';
ALTER TABLE "character_interactions" ADD COLUMN IF NOT EXISTS "retentionDays" INTEGER NOT NULL DEFAULT 365;
ALTER TABLE "character_interactions" ADD COLUMN IF NOT EXISTS "createdForRetention" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "conversation_messages_purposeTag_idx" ON "conversation_messages" ("purposeTag");
CREATE INDEX IF NOT EXISTS "character_interactions_purposeTag_idx" ON "character_interactions" ("purposeTag");
