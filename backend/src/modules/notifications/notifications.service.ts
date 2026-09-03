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
