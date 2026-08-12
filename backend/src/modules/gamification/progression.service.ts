import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProgressionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get learner's progression (level, XP, coins)
   */
  async getProgression(learnerId: string) {
    let progression = await this.prisma.progression.findUnique({
      where: { learnerId },
      include: {
        xpGains: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!progression) {
      // Create initial progression
      progression = await this.prisma.progression.create({
        data: {
          learnerId,
          level: 1,
          totalXP: 0,
          coins: 0,
        },
        include: {
          xpGains: true,
        },
      });
    }

    return progression;
  }

  /**
   * Award XP to learner
   */
  async awardXP(
    learnerId: string,
    amount: number,
    source: string,
    sourceId: string,
    reason?: string,
  ) {
    // Get or create progression
    let progression = await this.getProgression(learnerId);

    // Check if XP already awarded for this source
    const existing = await this.prisma.xPGain.findFirst({
      where: {
        learnerId: progression.id,
        source: source as any,
        sourceId,
      },
    });

    if (existing) {
      return { alreadyAwarded: true, progression };
    }

    // Record XP gain
    await this.prisma.xPGain.create({
      data: {
        learnerId: progression.id,
        amount,
        source: source as any,
        sourceId,
        reason,
      },
    });

    // Update progression
    const newTotalXP = progression.totalXP + amount;
    const newLevel = this.calculateLevel(newTotalXP);
    const leveledUp = newLevel > progression.level;

    progression = await this.prisma.progression.update({
      where: { learnerId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
      },
      include: {
        xpGains: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return {
      awarded: true,
      amount,
      leveledUp,
      newLevel: progression.level,
      progression,
    };
  }

  /**
   * Award coins
   */
  async awardCoins(learnerId: string, amount: number) {
    const progression = await this.prisma.progression.update({
      where: { learnerId },
      data: {
        coins: { increment: amount },
      },
    });

    return { success: true, newBalance: progression.coins };
  }

  /**
   * Spend coins
   */
  async spendCoins(learnerId: string, amount: number) {
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId },
    });

    if (!progression || progression.coins < amount) {
      throw new Error('Insufficient coins');
    }

    const updated = await this.prisma.progression.update({
      where: { learnerId },
      data: {
        coins: { decrement: amount },
      },
    });

    return { success: true, newBalance: updated.coins };
  }

  /**
   * Calculate level from total XP
   * Level 1: 0-99 XP
   * Level 2: 100-299 XP
   * Level 3: 300-599 XP
   * Each level requires progressively more XP
   */
  private calculateLevel(totalXP: number): number {
    if (totalXP < 100) return 1;
    if (totalXP < 300) return 2;
    if (totalXP < 600) return 3;
    if (totalXP < 1000) return 4;
    if (totalXP < 1500) return 5;
    if (totalXP < 2100) return 6;
    if (totalXP < 2800) return 7;
    if (totalXP < 3600) return 8;
    if (totalXP < 4500) return 9;
    if (totalXP < 5500) return 10;

    // Level 11+: each level requires 1000 more XP
    return 10 + Math.floor((totalXP - 5500) / 1000);
  }

  /**
   * Get XP required for next level
   */
  getXPForNextLevel(currentLevel: number): number {
    const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

    if (currentLevel < levels.length) {
      return levels[currentLevel];
    }

    return 5500 + (currentLevel - 10) * 1000;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10) {
    const progressions = await this.prisma.progression.findMany({
      where: {
        learner: {
          leaderboardOptIn: true,
        },
      },
      include: {
        learner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { totalXP: 'desc' },
      take: limit,
    });

    return progressions.map((p, index) => ({
      rank: index + 1,
      learnerId: p.learnerId,
      displayName: p.learner.displayName,
      avatarUrl: p.learner.avatarUrl,
      level: p.level,
      totalXP: p.totalXP,
    }));
  }

  /**
   * Get learner's rank
   */
  async getLearnerRank(learnerId: string) {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner?.leaderboardOptIn) {
      return { optedOut: true };
    }

    const progression = await this.prisma.progression.findUnique({
      where: { learnerId },
    });

    if (!progression) {
      return { rank: null };
    }

    const higherCount = await this.prisma.progression.count({
      where: {
        totalXP: { gt: progression.totalXP },
        learner: {
          leaderboardOptIn: true,
        },
      },
    });

    return {
      rank: higherCount + 1,
      totalXP: progression.totalXP,
      level: progression.level,
    };
  }
}
