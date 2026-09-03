import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Content QA Engine — v1.
 *
 * Distinct from two adjacent, already-existing systems (do not confuse
 * with either):
 *   - Rubric system (projects/rubrics.service.ts): human-authored grading
 *     criteria applied BY STAFF to a learner's PROJECT submission.
 *   - Assessment Quality Engine (questions module): auto-review of
 *     question ITEMS specifically (distractor quality, answer-key
 *     validity, etc.)
 *
 * This engine is neither: it is a general content-completeness/
 * readability sweep over Activity and Mission rows themselves (the
 * content the CMS/authoring tools produce), independent of whether
 * they're used for grading or as assessment items. It flags structural
 * content-quality problems an editor should fix before content ships to
 * learners: missing description, content payload too thin for its type,
 * no ageBand signal anywhere on the entity, zero AgeVariant coverage.
 *
 * The AgeVariant "zero coverage" check reuses the exact
 * entityType/entityId AgeVariant lookup pattern already established by
 * ContentAdaptationService (see
 * backend/src/modules/learning/services/content-adaptation.service.ts),
 * just aggregated across all rows of a type instead of one row at a
 * time.
 */

export type ContentQAEntityType = 'ACTIVITY' | 'MISSION';

export type ContentQAFlagType =
  | 'MISSING_DESCRIPTION'
  | 'CONTENT_TOO_SHORT'
  | 'NO_AGE_BAND_SIGNAL'
  | 'ZERO_AGE_VARIANT_COVERAGE';

export type ContentQASeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ContentQAFlagCandidate {
  entityType: ContentQAEntityType;
  entityId: string;
  flagType: ContentQAFlagType;
  severity: ContentQASeverity;
  detail: string;
}

export interface ContentQAScanResult {
  scannedAt: Date;
  activitiesScanned: number;
  missionsScanned: number;
  flagsFound: number;
  flagsCreated: number;
  flagsAlreadyOpen: number;
  candidates: ContentQAFlagCandidate[];
}

@Injectable()
export class ContentQaService {
  private readonly logger = new Logger(ContentQaService.name);

  // Minimum raw JSON.stringify length of Activity.content before it's
  // flagged as "too short for its type". Deliberately per-type: a SELECT
  // question with 4 options + a question string legitimately serializes
  // shorter than an EXPLAIN/CODE payload that needs real instructional
  // text. Thresholds picked from the real seed-data distribution (see
  // scan report) with headroom, not arbitrary round numbers.
  private readonly MIN_CONTENT_LENGTH_BY_TYPE: Record<string, number> = {
    SELECT: 40,
    MATCH: 40,
    SEQUENCE: 40,
    SOLVE: 40,
    EXPLAIN: 80,
    CREATE: 80,
    CODE: 80,
  };

  private readonly MIN_MISSION_DESCRIPTION_LENGTH = 20;

  constructor(private prisma: PrismaService) {}

  /**
   * Run the full scan over Activity + Mission content, returning every
   * real issue found. Pure read + in-memory evaluation — does NOT write
   * anything. Callers that want persistence should call
   * scanAndPersist().
   */
  async scan(): Promise<{
    activitiesScanned: number;
    missionsScanned: number;
    candidates: ContentQAFlagCandidate[];
  }> {
    const [activities, missions] = await Promise.all([
      this.prisma.activity.findMany({ where: { isActive: true } }),
      this.prisma.mission.findMany({ where: { isActive: true } }),
    ]);

    const [activityVariantCoverage, missionVariantCoverage] = await Promise.all([
      this.getEntityIdsWithAgeVariant('ACTIVITY'),
      this.getEntityIdsWithAgeVariant('MISSION'),
    ]);

    const candidates: ContentQAFlagCandidate[] = [];

    for (const activity of activities) {
      candidates.push(...this.checkActivity(activity, activityVariantCoverage));
    }

    for (const mission of missions) {
      candidates.push(...this.checkMission(mission, missionVariantCoverage));
    }

    return {
      activitiesScanned: activities.length,
      missionsScanned: missions.length,
      candidates,
    };
  }

  /**
   * Run the scan and persist every candidate as a ContentQAFlag row,
   * skipping ones that already have an open (unresolved) flag of the
   * same entityType/entityId/flagType so re-running the scan doesn't
   * spam duplicates.
   */
  async scanAndPersist(): Promise<ContentQAScanResult> {
    const { activitiesScanned, missionsScanned, candidates } = await this.scan();

    let created = 0;
    let alreadyOpen = 0;

    for (const candidate of candidates) {
      const existingOpen = await this.prisma.contentQAFlag.findFirst({
        where: {
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          flagType: candidate.flagType,
          resolvedAt: null,
        },
      });

      if (existingOpen) {
        alreadyOpen++;
        continue;
      }

      await this.prisma.contentQAFlag.create({
        data: {
          entityType: candidate.entityType,
          entityId: candidate.entityId,
          flagType: candidate.flagType,
          severity: candidate.severity,
          detail: candidate.detail,
        },
      });
      created++;
    }

    this.logger.log(
      `Content QA scan: ${activitiesScanned} activities, ${missionsScanned} missions scanned, ` +
        `${candidates.length} issues found (${created} new flags, ${alreadyOpen} already open).`,
    );

    return {
      scannedAt: new Date(),
      activitiesScanned,
      missionsScanned,
      flagsFound: candidates.length,
      flagsCreated: created,
      flagsAlreadyOpen: alreadyOpen,
      candidates,
    };
  }

  async listOpenFlags(params?: { entityType?: string; flagType?: string; take?: number }) {
    return this.prisma.contentQAFlag.findMany({
      where: {
        resolvedAt: null,
        ...(params?.entityType ? { entityType: params.entityType } : {}),
        ...(params?.flagType ? { flagType: params.flagType } : {}),
      },
      orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
      take: params?.take ?? 200,
    });
  }

  // ---------------------------------------------------------------
  // Per-entity checks
  // ---------------------------------------------------------------

  private checkActivity(
    activity: {
      id: string;
      type: string;
      title: string;
      description: string | null;
      content: unknown;
    },
    variantCoveredIds: Set<string>,
  ): ContentQAFlagCandidate[] {
    const flags: ContentQAFlagCandidate[] = [];

    if (!activity.description || activity.description.trim().length === 0) {
      flags.push({
        entityType: 'ACTIVITY',
        entityId: activity.id,
        flagType: 'MISSING_DESCRIPTION',
        severity: 'LOW',
        detail: `Activity "${activity.title}" (${activity.type}) has no description.`,
      });
    }

    const contentLength = JSON.stringify(activity.content ?? '').length;
    const minLength = this.MIN_CONTENT_LENGTH_BY_TYPE[activity.type] ?? 40;
    if (contentLength < minLength) {
      flags.push({
        entityType: 'ACTIVITY',
        entityId: activity.id,
        flagType: 'CONTENT_TOO_SHORT',
        severity: 'MEDIUM',
        detail: `Activity "${activity.title}" (${activity.type}) content is ${contentLength} chars, below the ${minLength}-char minimum expected for this type.`,
      });
    }

    // Activity has no direct ageBand column of its own — its age
    // targeting signal comes entirely from having at least one
    // AgeVariant row. That's covered by ZERO_AGE_VARIANT_COVERAGE below,
    // so we don't double-flag NO_AGE_BAND_SIGNAL for activities.

    if (!variantCoveredIds.has(activity.id)) {
      flags.push({
        entityType: 'ACTIVITY',
        entityId: activity.id,
        flagType: 'ZERO_AGE_VARIANT_COVERAGE',
        severity: 'HIGH',
        detail: `Activity "${activity.title}" (${activity.type}) has zero AgeVariant rows — no age-band adaptation exists for any of the 3 age bands.`,
      });
    }

    return flags;
  }

  private checkMission(
    mission: { id: string; title: string; description: string | null },
    variantCoveredIds: Set<string>,
  ): ContentQAFlagCandidate[] {
    const flags: ContentQAFlagCandidate[] = [];

    if (!mission.description || mission.description.trim().length === 0) {
      flags.push({
        entityType: 'MISSION',
        entityId: mission.id,
        flagType: 'MISSING_DESCRIPTION',
        severity: 'LOW',
        detail: `Mission "${mission.title}" has no description.`,
      });
    } else if (mission.description.trim().length < this.MIN_MISSION_DESCRIPTION_LENGTH) {
      flags.push({
        entityType: 'MISSION',
        entityId: mission.id,
        flagType: 'CONTENT_TOO_SHORT',
        severity: 'MEDIUM',
        detail: `Mission "${mission.title}" description is only ${mission.description.trim().length} chars (min expected ${this.MIN_MISSION_DESCRIPTION_LENGTH}).`,
      });
    }

    if (!variantCoveredIds.has(mission.id)) {
      flags.push({
        entityType: 'MISSION',
        entityId: mission.id,
        flagType: 'ZERO_AGE_VARIANT_COVERAGE',
        severity: 'HIGH',
        detail: `Mission "${mission.title}" has zero AgeVariant rows — no age-band adaptation exists for any of the 3 age bands.`,
      });
    }

    return flags;
  }

  /**
   * Same entityType/entityId AgeVariant lookup pattern
   * ContentAdaptationService.getAdapted*() uses per-row, aggregated here
   * into a Set of covered entityIds for a whole entityType in one query
   * — the coverage-detection half of what
   * ContentAdaptationService.getVariantCoverage() already reports as a
   * percentage, reused here to find the actual zero-coverage rows rather
   * than just the aggregate number.
   */
  private async getEntityIdsWithAgeVariant(entityType: ContentQAEntityType): Promise<Set<string>> {
    const rows = await this.prisma.ageVariant.findMany({
      where: { entityType },
      select: { entityId: true },
      distinct: ['entityId'],
    });
    return new Set(rows.map((r) => r.entityId));
  }
}
