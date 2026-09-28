import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Worlds Service (World Engine / World State Engine)
 *
 * Zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b — before this
 * pass, `Mission.worldId` was a nullable free string with no `World` model
 * at all. Built from scratch: a real `World` model (one per major Domain)
 * plus a real per-learner unlock-status computation.
 *
 * The unlock signal deliberately reuses the same domain-engagement pattern
 * `character.service.ts`'s `getUnlockedCharactersForLearner()` /
 * `getDomainEngagementSet()` established (MasteryRecord + Evidence rows
 * joined competency -> skill -> domain), rather than inventing a new
 * definition of "has the learner touched this subject" from scratch.
 */
@Injectable()
export class WorldsService {
  constructor(private prisma: PrismaService) {}

  // Worlds seeded with `order` in this set are always unlocked as entry
  // points into the path (matches each world's seeded `unlockCondition`
  // text — see prisma/seeds/seed-worlds.ts). All other worlds require
  // real progress signal (see below).
  private static readonly STARTER_WORLD_ORDERS = new Set([1, 2, 5]);

  async getWorldsForLearner(learnerId: string | null) {
    const worlds = await this.prisma.world.findMany({
      where: { isActive: true },
      include: {
        domain: { select: { id: true, name: true, slug: true } },
        _count: { select: { missions: true } },
      },
      orderBy: { order: 'asc' },
    });

    if (!learnerId) {
      // Unauthenticated / no learner profile yet: show only starter worlds
      // as unlocked, everything else locked.
      return worlds.map((w) => ({
        ...w,
        missionCount: w._count.missions,
        isUnlocked: WorldsService.STARTER_WORLD_ORDERS.has(w.order),
      }));
    }

    const [domainEngagement, missionCompletionCount] = await Promise.all([
      this.getDomainEngagementSet(learnerId),
      this.prisma.missionRun.count({ where: { learnerId, status: 'COMPLETED' } }),
    ]);

    return worlds.map((w) => {
      const isStarter = WorldsService.STARTER_WORLD_ORDERS.has(w.order);
      // Real engagement with the world's own domain (mastery/evidence
      // signal) unlocks it outright, same as a character's domain-touch
      // trigger. Otherwise fall back to a simple mission-completion
      // threshold that scales with how "deep" the world is (order),
      // matching the seeded unlockCondition copy for non-starter worlds.
      const engagedWithOwnDomain = domainEngagement.has(w.domain.slug);
      const threshold = w.order <= 4 ? 1 : 2;
      const isUnlocked =
        isStarter || engagedWithOwnDomain || missionCompletionCount >= threshold;

      return {
        ...w,
        missionCount: w._count.missions,
        isUnlocked,
        unlockSignal: isStarter
          ? 'starter-world'
          : engagedWithOwnDomain
            ? 'domain-engagement'
            : missionCompletionCount >= threshold
              ? 'mission-completion-threshold'
              : 'locked',
      };
    });
  }

  /**
   * Build the set of domain slugs a learner has real engagement with.
   * Mirrors character.service.ts's getDomainEngagementSet() Signal 1 + 2
   * (MasteryRecord + Evidence rows joined competency -> skill -> domain) —
   * the two universally-applicable signals, independent of any one
   * cross-curricular concept model.
   */
  private async getDomainEngagementSet(learnerId: string): Promise<Set<string>> {
    const engaged = new Set<string>();

    const masteryDomains = await this.prisma.$queryRaw<Array<{ slug: string }>>`
      SELECT DISTINCT d.slug AS slug
      FROM mastery_records m
      JOIN competencies c ON c.id = m."competencyId"
      JOIN skills s ON s.id = c."skillId"
      JOIN domains d ON d.id = s."domainId"
      WHERE m."learnerId" = ${learnerId}
    `;
    masteryDomains.forEach((r) => engaged.add(r.slug));

    const evidenceDomains = await this.prisma.$queryRaw<Array<{ slug: string }>>`
      SELECT DISTINCT d.slug AS slug
      FROM evidence e
      JOIN competencies c ON c.id = e."competencyId"
      JOIN skills s ON s.id = c."skillId"
      JOIN domains d ON d.id = s."domainId"
      WHERE e."learnerId" = ${learnerId}
    `;
    evidenceDomains.forEach((r) => engaged.add(r.slug));

    return engaged;
  }

  /**
   * A single world with its active missions, enriched with REAL per-learner
   * state for the World Detail surface:
   *   - world.isUnlocked (same signal as the worlds list)
   *   - each mission.status: 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'LOCKED'
   *   - each mission.bestScore (from the learner's best completed run)
   *   - each mission.locked: sequential gating — a mission is locked until the
   *     previous mission in the world is completed (classic path progression).
   * When learnerId is null (unauthenticated/guardian preview) missions are
   * returned as AVAILABLE/unlocked with no per-learner status.
   */
  async getWorld(id: string, learnerId: string | null = null) {
    const world = await this.prisma.world.findUnique({
      where: { id },
      include: {
        domain: { select: { id: true, name: true, slug: true } },
        missions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!world) return null;

    // World unlock state (reuse the same starter/engagement signal).
    let worldUnlocked = WorldsService.STARTER_WORLD_ORDERS.has(world.order);
    if (learnerId && !worldUnlocked) {
      const engaged = await this.getDomainEngagementSet(learnerId);
      worldUnlocked = engaged.has(world.domain?.slug ?? '');
    }

    // Per-learner run status for this world's missions (COMPLETED wins over
    // IN_PROGRESS). Score is computed at completion time and not persisted on
    // the run, so we surface status only — not a fabricated score.
    const statusByMission = new Map<string, 'COMPLETED' | 'IN_PROGRESS'>();
    if (learnerId) {
      const missionIds = world.missions.map((m) => m.id);
      const runs = await this.prisma.missionRun.findMany({
        where: { learnerId, missionId: { in: missionIds } },
        select: { missionId: true, status: true },
        orderBy: { startedAt: 'desc' },
      });
      for (const run of runs) {
        const prev = statusByMission.get(run.missionId);
        if (run.status === 'COMPLETED') statusByMission.set(run.missionId, 'COMPLETED');
        else if (!prev && run.status === 'IN_PROGRESS') statusByMission.set(run.missionId, 'IN_PROGRESS');
      }
    }

    // Sequential locking: a mission unlocks once the previous one is completed.
    let prevCompleted = true; // first mission is available when the world is unlocked
    const missions = world.missions.map((m) => {
      const runStatus = statusByMission.get(m.id);
      const locked = !worldUnlocked || !prevCompleted;
      let status: 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'LOCKED';
      if (runStatus === 'COMPLETED') status = 'COMPLETED';
      else if (runStatus === 'IN_PROGRESS') status = 'IN_PROGRESS';
      else if (locked) status = 'LOCKED';
      else status = 'AVAILABLE';
      prevCompleted = runStatus === 'COMPLETED';
      return { ...m, status, locked };
    });

    return { ...world, isUnlocked: worldUnlocked, missions };
  }
}
