import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Real XP-spending economy: learners unlock cosmetic items (borders, badges,
 * titles, dashboard color themes) by spending earned XP. All spend is a
 * single atomic transaction — balance check + XP decrement + unlock row
 * creation happen together, so there's no window where XP is deducted
 * without the unlock landing (or vice versa).
 */
@Injectable()
export class CosmeticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * List every cosmetic in the catalog, annotated per-learner with
   * ownership + affordability so the shop UI can render locked/owned/
   * affordable state without a second round trip.
   */
  async listCosmetics(learnerId: string) {
    const [cosmetics, progression, unlocks] = await Promise.all([
      this.prisma.avatarCosmetic.findMany({ orderBy: [{ category: 'asc' }, { xpCost: 'asc' }] }),
      this.prisma.progression.findUnique({ where: { learnerId } }),
      this.prisma.learnerCosmeticUnlock.findMany({ where: { learnerId } }),
    ]);

    const unlockByCosmeticId = new Map(unlocks.map((u) => [u.cosmeticId, u]));
    const totalXP = progression?.totalXP ?? 0;

    return {
      totalXP,
      items: cosmetics.map((c) => {
        const unlock = unlockByCosmeticId.get(c.id);
        const owned = !!unlock || c.isDefault;
        return {
          id: c.id,
          name: c.name,
          category: c.category,
          xpCost: c.xpCost,
          iconOrStyleKey: c.iconOrStyleKey,
          isDefault: c.isDefault,
          owned,
          canAfford: !owned && totalXP >= c.xpCost,
          isEquipped: c.isDefault && !unlock ? false : !!unlock?.isEquipped,
        };
      }),
    };
  }

  /**
   * Spend XP to unlock a cosmetic. Atomic: re-reads progression + does the
   * balance check + XP decrement + unlock-row creation inside one Prisma
   * transaction, so a double-click / race can't double-spend.
   */
  async unlock(learnerId: string, cosmeticId: string) {
    const cosmetic = await this.prisma.avatarCosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic) {
      throw new NotFoundException('Cosmetic not found');
    }

    if (cosmetic.isDefault) {
      throw new BadRequestException('This cosmetic is already free/owned by default');
    }

    const existing = await this.prisma.learnerCosmeticUnlock.findUnique({
      where: { learnerId_cosmeticId: { learnerId, cosmeticId } },
    });
    if (existing) {
      throw new BadRequestException('Already unlocked');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const progression = await tx.progression.findUnique({ where: { learnerId } });
      if (!progression) {
        throw new BadRequestException('No progression record for learner');
      }
      if (progression.totalXP < cosmetic.xpCost) {
        throw new BadRequestException(
          `Insufficient XP: need ${cosmetic.xpCost}, have ${progression.totalXP}`,
        );
      }

      const updatedProgression = await tx.progression.update({
        where: { learnerId },
        data: { totalXP: { decrement: cosmetic.xpCost } },
      });

      const unlock = await tx.learnerCosmeticUnlock.create({
        data: { learnerId, cosmeticId, isEquipped: false },
      });

      return { unlock, remainingXP: updatedProgression.totalXP };
    });

    return {
      success: true,
      cosmetic,
      remainingXP: result.remainingXP,
      unlock: result.unlock,
    };
  }

  /**
   * Equip a cosmetic the learner already owns. Un-equips any other
   * cosmetic in the same category (only one border/badge/title/theme
   * active at a time) inside a transaction.
   */
  async equip(learnerId: string, cosmeticId: string) {
    const cosmetic = await this.prisma.avatarCosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic) {
      throw new NotFoundException('Cosmetic not found');
    }

    if (!cosmetic.isDefault) {
      const owned = await this.prisma.learnerCosmeticUnlock.findUnique({
        where: { learnerId_cosmeticId: { learnerId, cosmeticId } },
      });
      if (!owned) {
        throw new BadRequestException('You must unlock this cosmetic before equipping it');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Un-equip whatever else is equipped in this category
      const sameCategoryCosmetics = await tx.avatarCosmetic.findMany({
        where: { category: cosmetic.category },
        select: { id: true },
      });
      const ids = sameCategoryCosmetics.map((c) => c.id);

      await tx.learnerCosmeticUnlock.updateMany({
        where: { learnerId, cosmeticId: { in: ids }, isEquipped: true },
        data: { isEquipped: false },
      });

      if (cosmetic.isDefault) {
        // Defaults have no unlock row required — but if the learner
        // previously unlocked-then-equipped it explicitly, make sure that
        // row (if it exists) is set to equipped too for consistency.
        await tx.learnerCosmeticUnlock.updateMany({
          where: { learnerId, cosmeticId },
          data: { isEquipped: true },
        });
      } else {
        await tx.learnerCosmeticUnlock.update({
          where: { learnerId_cosmeticId: { learnerId, cosmeticId } },
          data: { isEquipped: true },
        });
      }
    });

    return { success: true, equipped: cosmetic };
  }

  /**
   * Get the learner's currently-equipped cosmetic per category, for
   * rendering on the dashboard (border color, title text, theme accent).
   */
  async getEquipped(learnerId: string) {
    const unlocks = await this.prisma.learnerCosmeticUnlock.findMany({
      where: { learnerId, isEquipped: true },
      include: { cosmetic: true },
    });

    const equipped: Record<string, { id: string; name: string; iconOrStyleKey: string } | null> = {
      BORDER: null,
      BADGE: null,
      TITLE: null,
      COLOR_THEME: null,
    };

    for (const u of unlocks) {
      equipped[u.cosmetic.category] = {
        id: u.cosmetic.id,
        name: u.cosmetic.name,
        iconOrStyleKey: u.cosmetic.iconOrStyleKey,
      };
    }

    return equipped;
  }
}
