import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Daily Learning Engine ("Daily Goal")
 *
 * DailyGoal stores the learner's target minutes/activities per day.
 * Real progress is computed server-side from today's LearningEvent rows —
 * ACTIVITY_COMPLETED count for the activity target, and session-derived
 * minutes (from ACTIVITY_STARTED -> ACTIVITY_COMPLETED pairs' timestamps,
 * falling back to a flat per-completed-activity estimate when a start
 * event wasn't recorded) for the minutes target. Not a client-side counter.
 */
@Injectable()
export class DailyGoalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getGoal(learnerId: string) {
    let goal = await this.prisma.dailyGoal.findUnique({ where: { learnerId } });
    if (!goal) {
      // Sensible default goal auto-created on first read so the dashboard
      // ring always has something real to show.
      goal = await this.prisma.dailyGoal.create({
        data: { learnerId, targetMinutes: 15, targetActivities: 3 },
      });
    }
    return goal;
  }

  async setGoal(learnerId: string, targetMinutes: number, targetActivities: number) {
    return this.prisma.dailyGoal.upsert({
      where: { learnerId },
      update: { targetMinutes, targetActivities },
      create: { learnerId, targetMinutes, targetActivities },
    });
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Real progress check against today's LearningEvent count.
   */
  async getTodayProgress(learnerId: string) {
    const goal = await this.getGoal(learnerId);
    const since = this.startOfToday();

    const [completedActivities, startedActivities] = await Promise.all([
      this.prisma.learningEvent.findMany({
        where: { learnerId, type: 'ACTIVITY_COMPLETED', createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.learningEvent.findMany({
        where: { learnerId, type: 'ACTIVITY_STARTED', createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Pair each completion with the most recent prior start of the same
    // entity to estimate real elapsed minutes; fall back to a 3-minute
    // flat estimate per completed activity when no matching start exists.
    let minutesSpent = 0;
    for (const completion of completedActivities) {
      const matchingStart = [...startedActivities]
        .reverse()
        .find(
          (s) =>
            s.entityId === completion.entityId &&
            s.createdAt <= completion.createdAt,
        );
      if (matchingStart) {
        minutesSpent +=
          (completion.createdAt.getTime() - matchingStart.createdAt.getTime()) / 60000;
      } else {
        minutesSpent += 3;
      }
    }

    const activitiesCompleted = completedActivities.length;
    const goalMet =
      minutesSpent >= goal.targetMinutes || activitiesCompleted >= goal.targetActivities;

    if (goalMet) {
      // Real Notification Engine trigger — dedupes internally against an
      // existing DAILY_GOAL_COMPLETE notification created today.
      await this.notificationsService.emitDailyGoalComplete(learnerId);
    }

    return {
      goal: {
        targetMinutes: goal.targetMinutes,
        targetActivities: goal.targetActivities,
      },
      progress: {
        minutesSpent: Math.round(minutesSpent),
        activitiesCompleted,
      },
      percentComplete: {
        minutes: Math.min(100, Math.round((minutesSpent / goal.targetMinutes) * 100)),
        activities: Math.min(
          100,
          Math.round((activitiesCompleted / goal.targetActivities) * 100),
        ),
      },
      goalMet,
    };
  }
}
