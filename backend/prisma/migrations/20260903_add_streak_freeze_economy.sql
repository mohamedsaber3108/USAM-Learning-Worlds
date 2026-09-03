-- Coin-spending economy #2: Streak Freeze (distinct from the XP-spending
-- cosmetic shop added in 20260902_add_cosmetic_shop.sql). Learners spend
-- Progression.coins to buy a freeze token that protects their streak the
-- next time they miss a practice day (Duolingo pattern).

ALTER TABLE "practice_streaks"
  ADD COLUMN "freezesAvailable" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastFreezeUsedAt" TIMESTAMP(3);

CREATE TABLE "streak_freeze_purchases" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "coinsCost" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "streak_freeze_purchases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "streak_freeze_purchases_learnerId_idx" ON "streak_freeze_purchases"("learnerId");
