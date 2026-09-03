import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProgressionService } from './progression.service';

/**
 * Real coin-spending economy #2 — Streak Freeze.
 *
 * The XP-spending cosmetic shop (cosmetics.service.ts) gives `totalXP` a
 * spending purpose. The separate `coins` field on Progression was earned
 * (100 signup bonus, awarded alongside XP elsewhere) but had NOTHING to
 * spend it on — an orphaned second currency. This service gives `coins` a
 * genuinely distinct purpose: buying a Streak Freeze token, the Duolingo-
 * pattern mechanic that protects a learner's streak the next time they
 * miss a practice day, instead of it resetting to 1.
 *
 * Purchase is atomic (balance check + coin decrement + freeze token credit
 * + ledger row, all in one Prisma transaction) so a double-click can't
 * double-spend, mirroring the cosmetic shop's transaction pattern.
 */
const STREAK_FREEZE_COST_COINS = 50;
const MAX_FREEZES_HELD = 2; // Duolingo caps freeze inventory too — avoid hoarding/pay-to-never-lose-streak

@Injectable()
export class StreakFreezeService {
  constructor(
    private prisma: PrismaService,
    private progression: ProgressionService,
  ) {}

  /**
   * Status for the UI: coin balance, freezes currently held, cost, and
   * whether the learner can afford + is under the hold cap.
   */
  async getStatus(learnerId: string) {
    const [progressionRecord, streak] = await Promise.all([
      this.progression.getProgression(learnerId),
      this.prisma.practiceStreak.findUnique({ where: { learnerId } }),
    ]);

    const freezesAvailable = streak?.freezesAvailable ?? 0;
    const coins = progressionRecord.coins;

    return {
      coins,
      freezesAvailable,
      costCoins: STREAK_FREEZE_COST_COINS,
      maxFreezesHeld: MAX_FREEZES_HELD,
      canAfford: coins >= STREAK_FREEZE_COST_COINS,
      atCap: freezesAvailable >= MAX_FREEZES_HELD,
      lastFreezeUsedAt: streak?.lastFreezeUsedAt ?? null,
    };
  }

  /**
   * Spend coins to buy one Streak Freeze token. Atomic transaction:
   * re-read coin balance, decrement, increment freezesAvailable on
   * PracticeStreak (creating the streak row if the learner has never
   * practiced yet), and write a StreakFreezePurchase ledger row.
   */
  async purchase(learnerId: string) {
    const streak = await this.prisma.practiceStreak.findUnique({ where: { learnerId } });
    const freezesAvailable = streak?.freezesAvailable ?? 0;

    if (freezesAvailable >= MAX_FREEZES_HELD) {
      throw new BadRequestException(
        `You can hold at most ${MAX_FREEZES_HELD} streak freezes at once`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const progressionRecord = await tx.progression.findUnique({ where: { learnerId } });
      if (!progressionRecord) {
        throw new BadRequestException('No progression record for learner');
      }
      if (progressionRecord.coins < STREAK_FREEZE_COST_COINS) {
        throw new BadRequestException(
          `Insufficient coins: need ${STREAK_FREEZE_COST_COINS}, have ${progressionRecord.coins}`,
        );
      }

      const updatedProgression = await tx.progression.update({
        where: { learnerId },
        data: { coins: { decrement: STREAK_FREEZE_COST_COINS } },
      });

      const updatedStreak = await tx.practiceStreak.upsert({
        where: { learnerId },
        create: {
          learnerId,
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: new Date(),
          freezesAvailable: 1,
        },
        update: {
          freezesAvailable: { increment: 1 },
        },
      });

      const purchase = await tx.streakFreezePurchase.create({
        data: { learnerId, coinsCost: STREAK_FREEZE_COST_COINS },
      });

      return { remainingCoins: updatedProgression.coins, freezesAvailable: updatedStreak.freezesAvailable, purchase };
    });

    return {
      success: true,
      remainingCoins: result.remainingCoins,
      freezesAvailable: result.freezesAvailable,
      purchase: result.purchase,
    };
  }
}
