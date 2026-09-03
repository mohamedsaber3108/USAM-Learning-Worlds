-- Asset Management Engine v1 (missing-wave2-cluster-9): add real
-- license/source/attribution fields to AvatarCosmetic per the gap
-- matrix's own suggestion, and backfill all existing hand-built cosmetics
-- with 'USAM Original' since none are externally sourced assets.
--
-- Content Provenance Engine v1 (missing-wave2-cluster-9): add a
-- sourceType enum (SEEDED/AI_GENERATED/HUMAN_AUTHORED) + createdBy field
-- to ContentItem, giving provenance metadata a home for future content.
--
-- Applied directly via psql on the live DB per this repo's established
-- convention for raw-SQL migrations (see Part 5b of
-- docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md).

ALTER TABLE "avatar_cosmetics" ADD COLUMN IF NOT EXISTS "license" TEXT;
ALTER TABLE "avatar_cosmetics" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "avatar_cosmetics" ADD COLUMN IF NOT EXISTS "attribution" TEXT;

UPDATE "avatar_cosmetics"
SET "license" = 'USAM Original', "source" = 'USAM Original'
WHERE "license" IS NULL;

DO $$ BEGIN
  CREATE TYPE "ContentSourceType" AS ENUM ('SEEDED', 'AI_GENERATED', 'HUMAN_AUTHORED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "content_items" ADD COLUMN IF NOT EXISTS "sourceType" "ContentSourceType" NOT NULL DEFAULT 'SEEDED';
ALTER TABLE "content_items" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

CREATE INDEX IF NOT EXISTS "content_items_sourceType_idx" ON "content_items" ("sourceType");
