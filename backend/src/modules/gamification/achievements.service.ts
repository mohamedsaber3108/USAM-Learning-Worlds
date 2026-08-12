import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get learner statistics for achievements
   */
  async getAchievementProgress(learnerId: string) {
    const stats = await this.getLearnerStats(learnerId);

    const achievements = {
      missions: this.getMissionAchievements(stats.completedMissions),
      mastery: this.getMasteryAchievements(stats.proficientCount),
      streak: this.getStreakAchievements(stats.longestStreak),
      projects: this.getProjectAchievements(stats.showcasedProjects),
    };

    const unlockedCount = Object.values(achievements).reduce(
      (sum, category: any) => sum + category.filter((a: any) => a.unlocked).length,
      0,
    );

    const totalCount = Object.values(achievements).reduce(
      (sum, category: any) => sum + category.length,
      0,
    );

    return {
      stats,
      achievements,
      summary: {
        unlocked: unlockedCount,
        total: totalCount,
        percentage: Math.round((unlockedCount / totalCount) * 100),
      },
    };
  }

  /**
   * Get learner statistics
   */
  private async getLearnerStats(learnerId: string) {
    const [missions, mastery, projects, streak, evidence] = await Promise.all([
      this.prisma.missionRun.count({
        where: { learnerId, status: 'COMPLETED' },
      }),
      this.prisma.masteryRecord.findMany({
        where: { learnerId },
      }),
      this.prisma.project.count({
        where: { learnerId, state: 'SHOWCASED' },
      }),
      this.prisma.practiceStreak.findUnique({
        where: { learnerId },
      }),
      this.prisma.evidence.count({
        where: { learnerId, success: true },
      }),
    ]);

    return {
      completedMissions: missions,
      proficientCount: mastery.filter((m) => m.confidence >= 0.7).length,
      showcasedProjects: projects,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      successfulEvidence: evidence,
    };
  }

  /**
   * Get mission achievements
   */
  private getMissionAchievements(completed: number) {
    const milestones = [
      { threshold: 1, title: 'First Mission', description: 'Complete your first mission', xp: 50, rarity: 'COMMON' },
      { threshold: 5, title: '5 Missions', description: 'Complete 5 missions', xp: 100, rarity: 'UNCOMMON' },
      { threshold: 10, title: '10 Missions', description: 'Complete 10 missions', xp: 200, rarity: 'RARE' },
      { threshold: 25, title: '25 Missions', description: 'Complete 25 missions', xp: 500, rarity: 'EPIC' },
      { threshold: 50, title: '50 Missions', description: 'Complete 50 missions', xp: 1000, rarity: 'LEGENDARY' },
    ];

    return milestones.map((m) => ({
      ...m,
      unlocked: completed >= m.threshold,
      progress: Math.min(completed, m.threshold),
    }));
  }

  /**
   * Get mastery achievements
   */
  private getMasteryAchievements(proficient: number) {
    const milestones = [
      { threshold: 1, title: 'First Mastery', description: 'Master your first competency', xp: 50, rarity: 'COMMON' },
      { threshold: 5, title: '5 Masteries', description: 'Master 5 competencies', xp: 150, rarity: 'UNCOMMON' },
      { threshold: 10, title: '10 Masteries', description: 'Master 10 competencies', xp: 300, rarity: 'RARE' },
      { threshold: 20, title: '20 Masteries', description: 'Master 20 competencies', xp: 600, rarity: 'EPIC' },
    ];

    return milestones.map((m) => ({
      ...m,
      unlocked: proficient >= m.threshold,
      progress: Math.min(proficient, m.threshold),
    }));
  }

  /**
   * Get streak achievements
   */
  private getStreakAchievements(longest: number) {
    const milestones = [
      { threshold: 3, title: '3 Day Streak', description: 'Practice 3 days in a row', xp: 50, rarity: 'COMMON' },
      { threshold: 7, title: '7 Day Streak', description: 'Practice 7 days in a row', xp: 150, rarity: 'UNCOMMON' },
      { threshold: 14, title: '14 Day Streak', description: 'Practice 14 days in a row', xp: 300, rarity: 'RARE' },
      { threshold: 30, title: '30 Day Streak', description: 'Practice 30 days in a row', xp: 1000, rarity: 'EPIC' },
      { threshold: 100, title: '100 Day Streak', description: 'Practice 100 days in a row', xp: 5000, rarity: 'LEGENDARY' },
    ];

    return milestones.map((m) => ({
      ...m,
      unlocked: longest >= m.threshold,
      progress: Math.min(longest, m.threshold),
    }));
  }

  /**
   * Get project achievements
   */
  private getProjectAchievements(showcased: number) {
    const milestones = [
      { threshold: 1, title: 'First Project', description: 'Showcase your first project', xp: 100, rarity: 'COMMON' },
      { threshold: 3, title: '3 Projects', description: 'Showcase 3 projects', xp: 300, rarity: 'UNCOMMON' },
      { threshold: 5, title: '5 Projects', description: 'Showcase 5 projects', xp: 500, rarity: 'RARE' },
      { threshold: 10, title: '10 Projects', description: 'Showcase 10 projects', xp: 1000, rarity: 'EPIC' },
    ];

    return milestones.map((m) => ({
      ...m,
      unlocked: showcased >= m.threshold,
      progress: Math.min(showcased, m.threshold),
    }));
  }
}
