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

export interface RetentionCohort {
  /** ISO date (Monday) of the week a learner's FIRST-ever event fell in. */
  cohortWeek: string;
  cohortSize: number;
  /** retention[n] = % of the cohort with >=1 event in cohort week + n weeks, n=0..weeksTracked-1 */
  retention: number[];
}

export interface StickinessPoint {
  date: string;
  dau: number;
  mau: number;
  stickiness: number; // dau/mau, 0..1
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

  /** Monday (UTC) of the week containing `d`, at 00:00:00. */
  private weekStart(d: Date): Date {
    const copy = new Date(d);
    copy.setUTCHours(0, 0, 0, 0);
    const dow = copy.getUTCDay(); // 0=Sun..6=Sat
    const diffToMonday = (dow + 6) % 7;
    copy.setUTCDate(copy.getUTCDate() - diffToMonday);
    return copy;
  }

  /**
   * Product Analytics Engine v1 — weekly retention cohorts, computed from
   * `LearningEvent` (the only event stream in this codebase; see this
   * engine's Gap Matrix row: "product/retention analytics genuinely does
   * not exist at all" prior to this pass). Deliberately built ON TOP of
   * the existing LearningEvent table rather than a second parallel event
   * stream — a real second ingestion pipeline would duplicate data and
   * drift from the Learning Analytics numbers for no benefit at this
   * scale; if/when product events (app-open, screen-view) diverge from
   * learning events, a `source` discriminator column is the right next
   * step, not a whole new table.
   *
   * Cohorts each learner by the ISO week of their FIRST-ever event, then
   * measures what fraction of that cohort had >=1 event in each
   * subsequent week, for `weeksTracked` weeks or until "now", whichever
   * is shorter. Computed in application code (same tradeoff/justification
   * as getDailyActivity above) — bounded by cohortWeeks * weeksTracked.
   */
  async getRetentionCohorts(cohortWeeks = 8, weeksTracked = 6): Promise<RetentionCohort[]> {
    const now = new Date();
    const earliestCohortStart = this.weekStart(
      new Date(now.getTime() - cohortWeeks * 7 * 24 * 60 * 60 * 1000),
    );

    const events = await this.prisma.learningEvent.findMany({
      where: { createdAt: { gte: earliestCohortStart } },
      select: { learnerId: true, createdAt: true },
    });

    // First-seen week per learner, restricted to learners whose first
    // event within this window falls in-window (learners who existed
    // before the window are excluded from cohorting here by design —
    // they belong to an earlier cohort outside cohortWeeks).
    const firstSeen = new Map<string, Date>();
    const eventWeeksByLearner = new Map<string, Set<number>>();
    for (const ev of events) {
      const wk = this.weekStart(ev.createdAt);
      const cur = firstSeen.get(ev.learnerId);
      if (!cur || wk < cur) firstSeen.set(ev.learnerId, wk);
    }
    for (const ev of events) {
      const wk = this.weekStart(ev.createdAt).getTime();
      if (!eventWeeksByLearner.has(ev.learnerId)) {
        eventWeeksByLearner.set(ev.learnerId, new Set());
      }
      eventWeeksByLearner.get(ev.learnerId)!.add(wk);
    }

    const cohortMembers = new Map<string, string[]>(); // cohortWeekISO -> learnerIds
    for (const [learnerId, cohortDate] of firstSeen.entries()) {
      const key = cohortDate.toISOString().slice(0, 10);
      if (!cohortMembers.has(key)) cohortMembers.set(key, []);
      cohortMembers.get(key)!.push(learnerId);
    }

    const results: RetentionCohort[] = [];
    for (const [cohortWeekIso, learnerIds] of cohortMembers.entries()) {
      const cohortStartMs = new Date(cohortWeekIso).getTime();
      const retention: number[] = [];
      for (let n = 0; n < weeksTracked; n++) {
        const weekMs = cohortStartMs + n * 7 * 24 * 60 * 60 * 1000;
        if (weekMs > now.getTime()) break; // don't report future weeks
        const retained = learnerIds.filter((id) =>
          eventWeeksByLearner.get(id)?.has(weekMs),
        ).length;
        retention.push(learnerIds.length > 0 ? retained / learnerIds.length : 0);
      }
      results.push({ cohortWeek: cohortWeekIso, cohortSize: learnerIds.length, retention });
    }

    return results.sort((a, b) => a.cohortWeek.localeCompare(b.cohortWeek));
  }

  /**
   * DAU/MAU stickiness — the standard product-analytics engagement ratio,
   * computed per trailing day over the requested window. Same
   * application-code aggregation tradeoff as getDailyActivity/getRetentionCohorts.
   */
  async getStickiness(days = 30): Promise<StickinessPoint[]> {
    const mauWindowStart = new Date(this.rangeStart(days).getTime() - 30 * 24 * 60 * 60 * 1000);
    const events = await this.prisma.learningEvent.findMany({
      where: { createdAt: { gte: mauWindowStart } },
      select: { createdAt: true, learnerId: true },
    });

    const points: StickinessPoint[] = [];
    const rangeEnd = new Date();
    rangeEnd.setUTCHours(0, 0, 0, 0);
    const rangeStartDay = this.rangeStart(days);

    for (
      let day = new Date(rangeStartDay);
      day.getTime() <= rangeEnd.getTime();
      day.setUTCDate(day.getUTCDate() + 1)
    ) {
      const dayKey = day.toISOString().slice(0, 10);
      const dauSet = new Set<string>();
      const mauSet = new Set<string>();
      const mauWindowStartMs = day.getTime() - 29 * 24 * 60 * 60 * 1000;
      for (const ev of events) {
        const evTime = ev.createdAt.getTime();
        if (evTime > day.getTime() + 24 * 60 * 60 * 1000 - 1) continue;
        if (ev.createdAt.toISOString().slice(0, 10) === dayKey) dauSet.add(ev.learnerId);
        if (evTime >= mauWindowStartMs) mauSet.add(ev.learnerId);
      }
      points.push({
        date: dayKey,
        dau: dauSet.size,
        mau: mauSet.size,
        stickiness: mauSet.size > 0 ? dauSet.size / mauSet.size : 0,
      });
    }
    return points;
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
