-- Real XP-spending cosmetic economy: AvatarCosmetic catalog + per-learner
-- unlock/equip join table. Learners spend earned XP (via ProgressionService)
-- to unlock borders/badges/titles/color-themes and equip one per category.

CREATE TYPE "CosmeticCategory" AS ENUM ('BORDER', 'BADGE', 'TITLE', 'COLOR_THEME');

CREATE TABLE "avatar_cosmetics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CosmeticCategory" NOT NULL,
    "xpCost" INTEGER NOT NULL,
    "iconOrStyleKey" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avatar_cosmetics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "avatar_cosmetics_name_key" ON "avatar_cosmetics"("name");
CREATE INDEX "avatar_cosmetics_category_idx" ON "avatar_cosmetics"("category");

CREATE TABLE "learner_cosmetic_unlocks" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "cosmeticId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "learner_cosmetic_unlocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "learner_cosmetic_unlocks_learnerId_cosmeticId_key" ON "learner_cosmetic_unlocks"("learnerId", "cosmeticId");
CREATE INDEX "learner_cosmetic_unlocks_learnerId_idx" ON "learner_cosmetic_unlocks"("learnerId");
CREATE INDEX "learner_cosmetic_unlocks_cosmeticId_idx" ON "learner_cosmetic_unlocks"("cosmeticId");

ALTER TABLE "learner_cosmetic_unlocks" ADD CONSTRAINT "learner_cosmetic_unlocks_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_cosmetic_unlocks" ADD CONSTRAINT "learner_cosmetic_unlocks_cosmeticId_fkey"
    FOREIGN KEY ("cosmeticId") REFERENCES "avatar_cosmetics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
