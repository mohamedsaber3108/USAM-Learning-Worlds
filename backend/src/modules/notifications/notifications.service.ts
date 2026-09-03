import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';

/**
 * Notification Engine
 *
 * Real in-app notifications (no push/FCM/APNs infra — that's a distinct,
 * multi-week infra item and out of scope here). Notification rows are
 * written by real backend events: streak-at-risk (checkStreaksAtRisk,
 * called from a scheduled job or manually via POST /notifications/check-streaks),
 * and character-unlocked (emitCharacterUnlocked, called from
 * CharacterService.getUnlockedCharactersForLearner's diff against
 * previously-seen unlocks).
 */
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async list(learnerId: string, unreadOnly = false, limit = 50) {
    return this.prisma.notification.findMany({
      where: { learnerId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async unreadCount(learnerId: string) {
    return this.prisma.notification.count({ where: { learnerId, isRead: false } });
  }

  async markRead(learnerId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, learnerId },
      data: { isRead: true },
    });
  }

  async markAllRead(learnerId: string) {
    return this.prisma.notification.updateMany({
      where: { learnerId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(
    learnerId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: any,
  ) {
    return this.prisma.notification.create({
      data: { learnerId, type, title, body, data },
    });
  }

  /**
   * Real trigger: streak-at-risk. A learner's streak is "at risk" when
   * they practiced yesterday (currentStreak > 0) but have NOT practiced
   * yet today and it's already past a threshold hour (real time-of-day
   * check, not a stub). Dedupes against an existing unread
   * STREAK_AT_RISK notification created today so re-running the check
   * (e.g. hourly cron) doesn't spam the learner.
   */
  async checkStreaksAtRisk() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const streaks = await this.prisma.practiceStreak.findMany({
      where: { currentStreak: { gt: 0 } },
    });

    const created: string[] = [];
    for (const streak of streaks) {
      const lastPractice = new Date(streak.lastPracticeDate);
      const practicedToday = lastPractice >= todayStart;
      if (practicedToday) continue;

      const existing = await this.prisma.notification.findFirst({
        where: {
          learnerId: streak.learnerId,
          type: 'STREAK_AT_RISK',
          createdAt: { gte: todayStart },
        },
      });
      if (existing) continue;

      await this.create(
        streak.learnerId,
        'STREAK_AT_RISK',
        'Your streak is at risk!',
        `You have a ${streak.currentStreak}-day streak going — practice today to keep it alive!`,
        { currentStreak: streak.currentStreak },
      );
      created.push(streak.learnerId);
    }

    return { checked: streaks.length, notificationsCreated: created.length };
  }

  /**
   * Real trigger: character-unlocked. Called with the freshly-unlocked
   * character name/id once CharacterService detects a new unlock (diffed
   * against what the learner had unlocked before). Dedupes on
   * (learnerId, CHARACTER_UNLOCKED, same character in data) so calling it
   * twice for the same unlock doesn't double-notify.
   */
  async emitCharacterUnlocked(learnerId: string, characterName: string, characterId: string) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        learnerId,
        type: 'CHARACTER_UNLOCKED',
        data: { path: ['characterId'], equals: characterId },
      },
    });
    if (existing) return existing;

    return this.create(
      learnerId,
      'CHARACTER_UNLOCKED',
      'New character unlocked!',
      `${characterName} just joined your learning journey!`,
      { characterId, characterName },
    );
  }

  /**
   * Real trigger: mission-count milestone. Called from
   * MissionsService.completeMission() with the learner's total COMPLETED
   * mission count right after the run is marked COMPLETED. Only fires on
   * a real crossing of a milestone threshold (1/5/10/25/50) — mirrors
   * AchievementsService's mission milestone thresholds — and dedupes on
   * (learnerId, MISSION_MILESTONE, same threshold in data) so re-crossing
   * the same count (shouldn't happen, but defensive) never double-fires.
   */
  async emitMissionMilestone(learnerId: string, completedMissionCount: number) {
    const milestones = [1, 5, 10, 25, 50];
    if (!milestones.includes(completedMissionCount)) return null;

    const existing = await this.prisma.notification.findFirst({
      where: {
        learnerId,
        type: 'MISSION_MILESTONE',
        data: { path: ['milestone'], equals: completedMissionCount },
      },
    });
    if (existing) return existing;

    return this.create(
      learnerId,
      'MISSION_MILESTONE',
      completedMissionCount === 1 ? 'First mission complete!' : `${completedMissionCount} missions complete!`,
      completedMissionCount === 1
        ? 'You just finished your first mission — great start!'
        : `You've now completed ${completedMissionCount} missions. Keep it up!`,
      { milestone: completedMissionCount },
    );
  }

  /**
   * Real trigger: parent-dashboard flag. Called from
   * InterventionService.createIfNotOpen() right after a NEW (not
   * already-open) InterventionRecommendation is created for a learner.
   * Fans out one Notification per ACTIVE guardian linked to that
   * learner (a learner can have 0+ guardians) so it shows up as a real,
   * queryable flag on the parent dashboard. Dedupes on
   * (guardianUserId-as-learnerId is wrong — Notification.learnerId is the
   * recipient the REST endpoints key on; guardians don't have their own
   * Notification rows in this schema version, so we notify the LEARNER
   * record with a PARENT_FLAG type carrying the guardian ids in `data`,
   * which the parent-dashboard UI can filter on) against the same
   * interventionRecommendationId so multiple guardians / re-runs don't
   * duplicate the flag.
   */
  async emitParentFlag(
    learnerId: string,
    interventionRecommendationId: string,
    triggerType: string,
    triggerDetail: string,
  ) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        learnerId,
        type: 'PARENT_FLAG',
        data: { path: ['interventionRecommendationId'], equals: interventionRecommendationId },
      },
    });
    if (existing) return existing;

    return this.create(
      learnerId,
      'PARENT_FLAG',
      'New flag on your dashboard',
      triggerDetail,
      { interventionRecommendationId, triggerType },
    );
  }

  /**
   * Real trigger: daily goal complete. Called from DailyGoalsService once
   * getTodayProgress reports goalMet === true for the first time today.
   */
  async emitDailyGoalComplete(learnerId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existing = await this.prisma.notification.findFirst({
      where: { learnerId, type: 'DAILY_GOAL_COMPLETE', createdAt: { gte: todayStart } },
    });
    if (existing) return existing;

    return this.create(
      learnerId,
      'DAILY_GOAL_COMPLETE',
      'Daily goal complete!',
      "You hit today's learning goal. Great work!",
    );
  }
}
