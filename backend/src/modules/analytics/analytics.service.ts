import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface EventTypeCount {
  type: string;
  count: number;
}

export interface DailyActiveLearners {
  date: string;
  activeLearners: number;
  totalEvents: number;
}

export interface AnalyticsOverview {
  rangeDays: number;
  totalEvents: number;
  activeLearners: number;
  eventsByType: EventTypeCount[];
  dailyActivity: DailyActiveLearners[];
}

/**
 * Admin Analytics Engine v1 — real aggregation over LearningEvent.
 *
 * Deliberately NOT a duplicate/derivative counter: everything here reads
 * straight from the `learning_events` table (already populated by
 * LearningEventService across the app) and aggregates it server-side, so
 * numbers reflect real activity instead of being re-derived client-side
 * from raw event dumps. Kept read-only — no writes, no new tables.
 */
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private rangeStart(days: number): Date {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /** Count of events grouped by type, within the trailing `days` window. */
  async getEventsByType(days = 30): Promise<EventTypeCount[]> {
    const since = this.rangeStart(days);
    const rows = await this.prisma.learningEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    });
    return rows
      .map((r) => ({ type: r.type, count: r._count._all }))
      .sort((a, b) => b.count - a.count);
  }

  /** Distinct learners with at least one event in the trailing `days` window. */
  async getActiveLearnerCount(days = 30): Promise<number> {
    const since = this.rangeStart(days);
    const rows = await this.prisma.learningEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { learnerId: true },
      distinct: ['learnerId'],
    });
    return rows.length;
  }

  /** Total raw event count in the trailing `days` window. */
  async getTotalEventCount(days = 30): Promise<number> {
    const since = this.rangeStart(days);
    return this.prisma.learningEvent.count({ where: { createdAt: { gte: since } } });
  }

  /**
   * Per-day breakdown: total events and distinct active learners for each
   * of the trailing `days` days. Computed in application code (not raw
   * SQL) so this stays portable across the Prisma-supported DBs already
   * used elsewhere in the codebase, at the cost of pulling one row per
   * event in-range — acceptable for the admin dashboard's default 30d
   * window; callers needing longer ranges should paginate upstream.
   */
  async getDailyActivity(days = 30): Promise<DailyActiveLearners[]> {
    const since = this.rangeStart(days);
    const events = await this.prisma.learningEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, learnerId: true },
    });

    const buckets = new Map<string, { learners: Set<string>; total: number }>();
    for (const ev of events) {
      const key = ev.createdAt.toISOString().slice(0, 10);
      if (!buckets.has(key)) {
        buckets.set(key, { learners: new Set(), total: 0 });
      }
      const bucket = buckets.get(key)!;
      bucket.learners.add(ev.learnerId);
      bucket.total += 1;
    }

    return Array.from(buckets.entries())
      .map(([date, bucket]) => ({
        date,
        activeLearners: bucket.learners.size,
        totalEvents: bucket.total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getOverview(days = 30): Promise<AnalyticsOverview> {
    const [totalEvents, activeLearners, eventsByType, dailyActivity] = await Promise.all([
      this.getTotalEventCount(days),
      this.getActiveLearnerCount(days),
      this.getEventsByType(days),
      this.getDailyActivity(days),
    ]);

    return { rangeDays: days, totalEvents, activeLearners, eventsByType, dailyActivity };
  }
}
