import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProgressionService } from './progression.service';

@Injectable()
export class StreaksService {
  constructor(
    private prisma: PrismaService,
    private progression: ProgressionService,
  ) {}

  /**
   * Update practice streak
   */
  async updateStreak(learnerId: string) {
    const now = new Date();
    const today = this.getDateOnly(now);

    let streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId },
    });

    if (!streak) {
      // Create initial streak
      streak = await this.prisma.practiceStreak.create({
        data: {
          learnerId,
          currentStreak: 1,
          longestStreak: 1,
          lastPracticeDate: now,
        },
      });

      // Award XP for first practice
      await this.progression.awardXP(
        learnerId,
        10,
        'FIRST_TIME_BONUS',
        `practice-${today}`,
        'First practice of the day',
      );

      return { streak: 1, isNewRecord: true };
    }

    const lastPractice = this.getDateOnly(streak.lastPracticeDate);
    const daysDiff = this.getDaysDifference(lastPractice, today);

    if (daysDiff === 0) {
      // Already practiced today
      return { streak: streak.currentStreak, alreadyPracticed: true };
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      const newStreak = streak.currentStreak + 1;
      const isNewRecord = newStreak > streak.longestStreak;

      await this.prisma.practiceStreak.update({
        where: { learnerId },
        data: {
          currentStreak: newStreak,
          longestStreak: isNewRecord ? newStreak : streak.longestStreak,
          lastPracticeDate: now,
        },
      });

      // Award bonus XP for streak
      const bonusXP = this.getStreakBonusXP(newStreak);
      if (bonusXP > 0) {
        await this.progression.awardXP(
          learnerId,
          bonusXP,
          'STREAK_BONUS',
          `streak-${today}`,
          `${newStreak} day streak!`,
        );
      }

      return { streak: newStreak, isNewRecord, bonusXP };
    } else if (streak.freezesAvailable > 0) {
      // Coin-purchased Streak Freeze absorbs the missed day(s): consume one
      // freeze token, keep the streak alive instead of resetting to 1.
      const updated = await this.prisma.practiceStreak.update({
        where: { learnerId },
        data: {
          freezesAvailable: { decrement: 1 },
          lastPracticeDate: now,
          lastFreezeUsedAt: now,
        },
      });

      // Mark the oldest unused purchase as consumed (auditable ledger).
      const oldestUnused = await this.prisma.streakFreezePurchase.findFirst({
        where: { learnerId, usedAt: null },
        orderBy: { purchasedAt: 'asc' },
      });
      if (oldestUnused) {
        await this.prisma.streakFreezePurchase.update({
          where: { id: oldestUnused.id },
          data: { usedAt: now },
        });
      }

      return {
        streak: updated.currentStreak,
        freezeUsed: true,
        freezesRemaining: updated.freezesAvailable,
      };
    } else {
      // Streak broken - reset
      await this.prisma.practiceStreak.update({
        where: { learnerId },
        data: {
          currentStreak: 1,
          lastPracticeDate: now,
        },
      });

      return { streak: 1, streakBroken: true, previousStreak: streak.currentStreak };
    }
  }

  /**
   * Get streak bonus XP
   */
  private getStreakBonusXP(streak: number): number {
    if (streak === 3) return 25;
    if (streak === 7) return 50;
    if (streak === 14) return 100;
    if (streak === 30) return 300;
    if (streak % 7 === 0) return 50; // Every week
    return 0;
  }

  /**
   * Get learner's streak
   */
  async getStreak(learnerId: string) {
    const streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId },
    });

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        freezesAvailable: 0,
      };
    }

    // Check if streak is still active (practiced within last 24 hours)
    const now = new Date();
    const lastPractice = this.getDateOnly(streak.lastPracticeDate);
    const today = this.getDateOnly(now);
    const daysDiff = this.getDaysDifference(lastPractice, today);

    if (daysDiff > 1) {
      // Streak is broken but not yet updated
      return {
        currentStreak: 0,
        longestStreak: streak.longestStreak,
        lastPracticeDate: streak.lastPracticeDate,
        expired: true,
        freezesAvailable: streak.freezesAvailable,
      };
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastPracticeDate: streak.lastPracticeDate,
      practicedToday: daysDiff === 0,
      freezesAvailable: streak.freezesAvailable,
    };
  }

  /**
   * Get date without time
   */
  private getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Get days difference between two dates
   */
  private getDaysDifference(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
  }
}
