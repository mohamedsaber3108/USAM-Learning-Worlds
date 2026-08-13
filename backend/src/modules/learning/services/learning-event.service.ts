import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LearningEventType } from '@prisma/client';

interface EventData {
  learnerId: string;
  type: LearningEventType;
  entityType?: string;
  entityId?: string;
  data?: any;
  sessionId?: string;
}

interface EventStats {
  eventType: LearningEventType;
  count: number;
  lastOccurred: Date;
}

@Injectable()
export class LearningEventService {
  constructor(private prisma: PrismaService) {}

  async recordEvent(event: EventData) {
    return this.prisma.learningEvent.create({
      data: {
        learnerId: event.learnerId,
        type: event.type,
        entityType: event.entityType,
        entityId: event.entityId,
        data: event.data,
        sessionId: event.sessionId,
      },
    });
  }

  async recordActivityStarted(learnerId: string, activityId: string, sessionId?: string) {
    return this.recordEvent({
      learnerId,
      type: 'ACTIVITY_STARTED',
      entityType: 'ACTIVITY',
      entityId: activityId,
      sessionId,
    });
  }

  async recordActivityCompleted(
    learnerId: string,
    activityId: string,
    data: { success: boolean; score?: number; timeSpent?: number },
    sessionId?: string
  ) {
    return this.recordEvent({
      learnerId,
      type: 'ACTIVITY_COMPLETED',
      entityType: 'ACTIVITY',
      entityId: activityId,
      data,
      sessionId,
    });
  }

  async recordMasteryChanged(
    learnerId: string,
    competencyId: string,
    data: { previousState: string; newState: string; confidence: number }
  ) {
    return this.recordEvent({
      learnerId,
      type: 'MASTERY_CHANGED',
      entityType: 'COMPETENCY',
      entityId: competencyId,
      data,
    });
  }

  async recordHintRequested(learnerId: string, activityId: string, data: { hintIndex: number }, sessionId?: string) {
    return this.recordEvent({
      learnerId,
      type: 'HINT_REQUESTED',
      entityType: 'ACTIVITY',
      entityId: activityId,
      data,
      sessionId,
    });
  }

  async recordConversationStarted(
    learnerId: string,
    conversationId: string,
    data: { characterId: string; type: string },
    sessionId?: string
  ) {
    return this.recordEvent({
      learnerId,
      type: 'CONVERSATION_STARTED',
      entityType: 'CONVERSATION',
      entityId: conversationId,
      data,
      sessionId,
    });
  }

  async recordProjectStarted(learnerId: string, projectId: string, sessionId?: string) {
    return this.recordEvent({
      learnerId,
      type: 'PROJECT_STARTED',
      entityType: 'PROJECT',
      entityId: projectId,
      sessionId,
    });
  }

  async recordProjectCompleted(learnerId: string, projectId: string, data: any, sessionId?: string) {
    return this.recordEvent({
      learnerId,
      type: 'PROJECT_COMPLETED',
      entityType: 'PROJECT',
      entityId: projectId,
      data,
      sessionId,
    });
  }

  async getEventsForLearner(
    learnerId: string,
    options: {
      type?: LearningEventType;
      entityType?: string;
      entityId?: string;
      sessionId?: string;
      limit?: number;
      offset?: number;
      since?: Date;
    } = {}
  ) {
    return this.prisma.learningEvent.findMany({
      where: {
        learnerId,
        type: options.type,
        entityType: options.entityType,
        entityId: options.entityId,
        sessionId: options.sessionId,
        createdAt: options.since ? { gte: options.since } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 100,
      skip: options.offset || 0,
    });
  }

  async getEventStats(learnerId: string, since?: Date): Promise<EventStats[]> {
    const events = await this.prisma.learningEvent.groupBy({
      by: ['type'],
      where: {
        learnerId,
        createdAt: since ? { gte: since } : undefined,
      },
      _count: true,
      _max: { createdAt: true },
    });

    return events.map((e) => ({
      eventType: e.type,
      count: e._count,
      lastOccurred: e._max.createdAt!,
    }));
  }

  async getRecentActivity(learnerId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.prisma.learningEvent.findMany({
      where: {
        learnerId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getSessionSummary(sessionId: string) {
    const events = await this.prisma.learningEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) {
      return null;
    }

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const durationMs = lastEvent.createdAt.getTime() - firstEvent.createdAt.getTime();

    const eventCounts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activitiesCompleted = events.filter((e) => e.type === 'ACTIVITY_COMPLETED').length;

    const successfulActivities = events.filter(
      (e) => e.type === 'ACTIVITY_COMPLETED' && (e.data as any)?.success === true
    ).length;

    const hintsRequested = events.filter((e) => e.type === 'HINT_REQUESTED').length;

    return {
      sessionId,
      learnerId: firstEvent.learnerId,
      startTime: firstEvent.createdAt,
      endTime: lastEvent.createdAt,
      durationMinutes: Math.round(durationMs / 60000),
      totalEvents: events.length,
      eventCounts,
      metrics: {
        activitiesCompleted,
        successfulActivities,
        successRate: activitiesCompleted > 0 ? (successfulActivities / activitiesCompleted) * 100 : 0,
        hintsRequested,
      },
    };
  }

  async getLearningPatterns(learnerId: string, days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.learningEvent.findMany({
      where: {
        learnerId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
    });

    const activitiesByDay = new Map<string, number>();
    const activitiesByHour = new Array(24).fill(0);

    events
      .filter((e) => e.type === 'ACTIVITY_COMPLETED')
      .forEach((event) => {
        const date = event.createdAt.toISOString().split('T')[0];
        activitiesByDay.set(date, (activitiesByDay.get(date) || 0) + 1);

        const hour = event.createdAt.getHours();
        activitiesByHour[hour]++;
      });

    const mostActiveHour = activitiesByHour.indexOf(Math.max(...activitiesByHour));

    const avgActivitiesPerDay =
      activitiesByDay.size > 0
        ? Array.from(activitiesByDay.values()).reduce((a, b) => a + b, 0) / activitiesByDay.size
        : 0;

    const consistencyDays = Array.from(activitiesByDay.keys()).length;

    return {
      period: { days, since },
      activeDays: consistencyDays,
      consistency: Math.round((consistencyDays / days) * 100),
      avgActivitiesPerDay: Math.round(avgActivitiesPerDay * 10) / 10,
      peakLearningHour: mostActiveHour,
      hourlyDistribution: activitiesByHour,
    };
  }

  async deleteOldEvents(olderThanDays: number = 90) {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.learningEvent.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return {
      deleted: result.count,
      cutoffDate: cutoff,
    };
  }
}
