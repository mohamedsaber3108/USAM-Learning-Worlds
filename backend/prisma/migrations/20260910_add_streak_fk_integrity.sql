-- Audit T-P1-2 / DB-2: add real foreign-key integrity to the streak tables.
--
-- PracticeStreak.learnerId and StreakFreezePurchase.learnerId were previously
-- bare string columns with no FK to learners(id) — no referential integrity,
-- orphan rows possible. This migration adds the FK constraints with ON DELETE
-- CASCADE so a deleted learner's streak/freeze rows are cleaned up.
--
-- NOTE on XPGain: the Prisma field was renamed learnerId -> progressionId but
-- kept @map("learnerId"), so the physical column "learnerId" on xp_gains is
-- UNCHANGED and its existing FK to progression(id) already exists. No DDL is
-- required for xp_gains here — this migration only closes the two streak-table
-- gaps.
--
-- Idempotent: guarded so re-running is safe (matches this project's manual
-- psql apply convention; there is no prisma migrate history — see
-- scripts/check-migrations-applied.ts).

-- practice_streaks.learnerId -> learners.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'practice_streaks_learnerId_fkey'
      AND table_name = 'practice_streaks'
  ) THEN
    ALTER TABLE "practice_streaks"
      ADD CONSTRAINT "practice_streaks_learnerId_fkey"
      FOREIGN KEY ("learnerId") REFERENCES "learners"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- streak_freeze_purchases.learnerId -> learners.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'streak_freeze_purchases_learnerId_fkey'
      AND table_name = 'streak_freeze_purchases'
  ) THEN
    ALTER TABLE "streak_freeze_purchases"
      ADD CONSTRAINT "streak_freeze_purchases_learnerId_fkey"
      FOREIGN KEY ("learnerId") REFERENCES "learners"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
