-- Audit T-P1-4: real FSRS scheduler state on flashcard_reviews.
-- Replaces the naive confidence-bucket scheduler with ts-fsrs (FSRS).
-- Idempotent ADD COLUMN IF NOT EXISTS so re-running is safe (matches this
-- project's manual psql apply convention; see scripts/check-migrations-applied.ts).
-- Defaults match ts-fsrs createEmptyCard() so existing rows upgrade cleanly:
-- stability/difficulty 0 + reps 0 => treated as a brand-new card on next review.

ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "stability" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "fsrsState" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "reps" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "lapses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "elapsedDays" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "scheduledDays" INTEGER NOT NULL DEFAULT 0;
