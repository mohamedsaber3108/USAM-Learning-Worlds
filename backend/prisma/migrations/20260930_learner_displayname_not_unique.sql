-- Remove the inappropriate global-uniqueness requirement on Learner.displayName.
--
-- Rationale: this is a kids platform with no username concept (login is by
-- User.email; identity is the immutable learners.id). Real children routinely
-- share first names / nicknames, so a globally-unique display name caused
-- registration 500s (Prisma P2002 on `displayName`). displayName is now a
-- plain, human-friendly, NON-unique string, kept indexed for search only.
--
-- Idempotent + safe: drops the unique index if present, then guarantees a
-- plain btree index exists. No data change; no column type change.

-- 1) Drop the UNIQUE index (Prisma default name for @unique on this model).
DROP INDEX IF EXISTS "learners_displayName_key";

-- 2) Some environments may have materialised the constraint as a table
--    CONSTRAINT rather than a bare index — drop that form too if present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'learners_displayName_key'
  ) THEN
    ALTER TABLE "learners" DROP CONSTRAINT "learners_displayName_key";
  END IF;
END $$;

-- 3) Ensure the non-unique search index exists (matches @@index([displayName])).
CREATE INDEX IF NOT EXISTS "learners_displayName_idx" ON "learners"("displayName");
