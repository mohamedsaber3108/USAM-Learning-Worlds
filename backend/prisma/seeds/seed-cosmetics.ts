/**
 * Cosmetic Shop seed data — real "spend your XP" catalog.
 *
 * Costs are calibrated against the ACTUAL production XP scale observed via
 * psql on kids-server (2026-09-02): learner totalXP ranged 0-2450, coins
 * 100-120. So costs run 50 (near-instantly reachable at level 1) up to 1200
 * (a real stretch goal only the most active learner could afford today),
 * not arbitrary round numbers.
 */
import { PrismaClient, CosmeticCategory } from '@prisma/client';

export async function seedCosmetics(prisma: PrismaClient) {
  const items: Array<{
    name: string;
    category: CosmeticCategory;
    xpCost: number;
    iconOrStyleKey: string;
    isDefault?: boolean;
  }> = [
    // ---- Borders (profile frame around avatar) ----
    { name: 'Classic Frame', category: 'BORDER', xpCost: 0, iconOrStyleKey: 'border-slate', isDefault: true },
    { name: 'Sunny Gold Frame', category: 'BORDER', xpCost: 75, iconOrStyleKey: 'border-gold' },
    { name: 'Ocean Blue Frame', category: 'BORDER', xpCost: 150, iconOrStyleKey: 'border-blue' },
    { name: 'Cosmic Purple Frame', category: 'BORDER', xpCost: 350, iconOrStyleKey: 'border-purple' },
    { name: 'Diamond Elite Frame', category: 'BORDER', xpCost: 1200, iconOrStyleKey: 'border-diamond' },

    // ---- Badges (small icon shown on profile) ----
    { name: 'Starter Badge', category: 'BADGE', xpCost: 0, iconOrStyleKey: 'badge-star-outline', isDefault: true },
    { name: 'Shooting Star Badge', category: 'BADGE', xpCost: 100, iconOrStyleKey: 'badge-shooting-star' },
    { name: 'Flame Badge', category: 'BADGE', xpCost: 250, iconOrStyleKey: 'badge-flame' },
    { name: 'Crown Badge', category: 'BADGE', xpCost: 800, iconOrStyleKey: 'badge-crown' },

    // ---- Titles (text shown next to learner's name) ----
    { name: 'Rising Star', category: 'TITLE', xpCost: 50, iconOrStyleKey: 'title-rising-star' },
    { name: 'Code Explorer', category: 'TITLE', xpCost: 200, iconOrStyleKey: 'title-code-explorer' },
    { name: 'Streak Keeper', category: 'TITLE', xpCost: 400, iconOrStyleKey: 'title-streak-keeper' },

    // ---- Color Themes (dashboard accent color) ----
    { name: 'Classic Indigo', category: 'COLOR_THEME', xpCost: 0, iconOrStyleKey: 'theme-indigo', isDefault: true },
    { name: 'Sunset Orange', category: 'COLOR_THEME', xpCost: 120, iconOrStyleKey: 'theme-orange' },
    { name: 'Galaxy Pink', category: 'COLOR_THEME', xpCost: 500, iconOrStyleKey: 'theme-pink' },
  ];

  for (const item of items) {
    await prisma.avatarCosmetic.upsert({
      where: { name: item.name },
      update: {
        category: item.category,
        xpCost: item.xpCost,
        iconOrStyleKey: item.iconOrStyleKey,
        isDefault: item.isDefault ?? false,
      },
      create: {
        name: item.name,
        category: item.category,
        xpCost: item.xpCost,
        iconOrStyleKey: item.iconOrStyleKey,
        isDefault: item.isDefault ?? false,
      },
    });
  }

  console.log(`✅ Seeded ${items.length} cosmetic items`);
}

// Allow standalone execution: `ts-node prisma/seeds/seed-cosmetics.ts`
if (require.main === module) {
  const prisma = new PrismaClient();
  seedCosmetics(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
