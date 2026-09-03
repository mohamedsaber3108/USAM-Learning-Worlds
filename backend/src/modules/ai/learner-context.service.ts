/**
 * Learner Context Service
 *
 * Assembles rich learning context for AI personalization
 * Implements data minimization - only includes pedagogically necessary information
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LearnerContext, RetrievedContextItem } from './interfaces/learner-context.interface';

const MIN_QUESTION_LENGTH = 3;
const MAX_QUESTION_LENGTH = 200;
const MAX_RETRIEVED_ITEMS = 4;

@Injectable()
export class LearnerContextService {
  private readonly logger = new Logger(LearnerContextService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Build complete learner context for AI
   *
   * `question` (optional) is the learner's current free-text input. When
   * provided, it is used to run a real lightweight retrieval-grounding
   * pass (see `retrieveGroundingContext`) against Concept/ContentItem
   * rows and the results are attached as `context.retrievedContext`.
   * This is NOT a vector/embedding RAG pipeline (see
   * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md "RAG Engine" row,
   * still honestly logged Missing for that) - it's a legitimate, real,
   * much smaller first step: keyword/full-text matched, cited rows
   * distinct from the pre-existing plain context-stuffing.
   */
  async buildContext(
    learnerId: string,
    sessionId?: string,
    question?: string,
  ): Promise<LearnerContext> {
    const [learner, progression, mastery, recentEvidence, practiceStreak] =
      await Promise.all([
        this.prisma.learner.findUnique({
          where: { id: learnerId },
        }),
        this.prisma.progression.findUnique({
          where: { learnerId },
        }),
        this.prisma.masteryRecord.findMany({
          where: { learnerId },
          include: {
            competency: {
              include: {
                skill: {
                  include: {
                    domain: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.evidence.findMany({
          where: {
            learnerId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        this.prisma.practiceStreak.findUnique({
          where: { learnerId },
        }),
      ]);

    if (!learner) {
      throw new Error('Learner not found');
    }

    // Calculate mastery summary
    const masterySummary = this.calculateMasterySummary(mastery);
    const performanceSummary = this.calculatePerformanceSummary(recentEvidence);

    // Get current learning state (most recent mission run)
    const currentMissionRun = await this.prisma.missionRun.findFirst({
      where: {
        learnerId,
        status: 'IN_PROGRESS',
      },
      include: {
        mission: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    // Get current project
    const currentProject = await this.prisma.project.findFirst({
      where: {
        learnerId,
        state: { in: ['PLANNING', 'BUILDING', 'REVIEW'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Build context
    const context: LearnerContext = {
      learnerId,
      age: this.calculateAge(learner.dateOfBirth),
      ageBand: learner.ageBand,
      language: (learner.preferences as any)?.language || 'en',
      displayName: learner.firstName, // Only first name for privacy

      mastery: masterySummary,
      recentPerformance: performanceSummary,

      sessionId,
      sessionStartedAt: new Date(),
    };

    // Add current mission if exists
    if (currentMissionRun) {
      context.currentMission = {
        id: currentMissionRun.missionId,
        title: currentMissionRun.mission.title,
        type: currentMissionRun.mission.type,
      };
    }

    // Add current project if exists
    if (currentProject) {
      context.currentProject = {
        id: currentProject.id,
        title: currentProject.title,
      };
    }

    // Add preferences if available
    const prefs = learner.preferences as any;
    if (prefs) {
      context.preferences = {
        interactionStyle: prefs.interactionStyle,
        pacePreference: prefs.pacePreference,
        challengeLevel: prefs.challengeLevel,
      };
    }

    // Retrieval-grounding v1: only run when a real question was supplied.
    if (question) {
      const retrievedContext = await this.retrieveGroundingContext(question);
      if (retrievedContext.length > 0) {
        context.retrievedContext = retrievedContext;
      }
    }

    return context;
  }

  /**
   * Lightweight retrieval-grounding pass (NOT vector/embedding RAG — see
   * class-level doc comment on `buildContext`). Runs a real Postgres
   * full-text search (websearch_to_tsquery, same operator + parameterized
   * $queryRaw pattern already proven in
   * `modules/search/search.service.ts::SearchService.search()`) against
   * the learner's question text over two real content tables:
   *  - `concepts` (Concept.name + Concept.description, already has the
   *    generated `searchVector` + GIN index from
   *    prisma/migrations/20260903_add_search_engine_v1.sql)
   *  - `content_items` (ContentItem.title, PUBLISHED status only — Draft/
   *    validating rows are never surfaced to a learner). ContentItem has
   *    no `searchVector` column yet, so this queries `title` directly via
   *    `to_tsvector('english', title)` at query time (title is short and
   *    the table is small; a generated column can be added later if this
   *    needs to scale — deliberately not overreaching in this v1 slice).
   *
   * Each hit gets a stable `sourceTag` (e.g. "concept:<id>",
   * "content_item:<id>") that the system prompt explicitly instructs the
   * AI to cite when it actually draws on that item — real citeable
   * grounding, not silent context-stuffing.
   */
  async retrieveGroundingContext(rawQuestion: string): Promise<RetrievedContextItem[]> {
    const q = this.sanitizeQuestion(rawQuestion);
    if (q.length < MIN_QUESTION_LENGTH) {
      return [];
    }

    try {
      const [conceptRows, contentItemRows] = await Promise.all([
        this.prisma.$queryRaw<Array<{ id: string; title: string; snippet: string; rank: number }>>`
          SELECT
            c.id AS id,
            c.name AS title,
            ts_headline(
              'english',
              coalesce(c.description, ''),
              websearch_to_tsquery('english', ${q}),
              'MaxWords=25, MinWords=10, MaxFragments=1'
            ) AS snippet,
            ts_rank(c."searchVector", websearch_to_tsquery('english', ${q})) AS rank
          FROM concepts c
          WHERE c."searchVector" @@ websearch_to_tsquery('english', ${q})
            AND c."isActive" = true
          ORDER BY rank DESC
          LIMIT ${MAX_RETRIEVED_ITEMS}
        `,
        this.prisma.$queryRaw<Array<{ id: string; title: string; snippet: string; rank: number }>>`
          SELECT
            ci.id AS id,
            ci.title AS title,
            ts_headline(
              'english',
              ci.title,
              websearch_to_tsquery('english', ${q}),
              'MaxWords=25, MinWords=5, MaxFragments=1'
            ) AS snippet,
            ts_rank(to_tsvector('english', ci.title), websearch_to_tsquery('english', ${q})) AS rank
          FROM content_items ci
          WHERE to_tsvector('english', ci.title) @@ websearch_to_tsquery('english', ${q})
            AND ci.status = 'PUBLISHED'
          ORDER BY rank DESC
          LIMIT ${MAX_RETRIEVED_ITEMS}
        `,
      ]);

      // Combine both result sets and re-rank by the real ts_rank score,
      // highest first, then cap to MAX_RETRIEVED_ITEMS overall (not
      // per-table) so one type doesn't crowd out the other unfairly
      // beyond what its own real rank earned.
      const ranked = [...conceptRows.map((r) => ({ ...r, kind: 'concept' as const })),
        ...contentItemRows.map((r) => ({ ...r, kind: 'content_item' as const }))]
        .sort((a, b) => Number(b.rank) - Number(a.rank))
        .slice(0, MAX_RETRIEVED_ITEMS);

      return ranked.map((r) => ({
        type: r.kind,
        id: r.id,
        title: r.title,
        snippet: r.snippet,
        sourceTag: `${r.kind}:${r.id}`,
      }));
    } catch (err) {
      // Retrieval must never break context assembly / the AI call — log
      // server-side and degrade to no retrieved context, same failure
      // posture as SearchService.search().
      this.logger.error(
        `retrieveGroundingContext failed for question="${q}": ${(err as Error).message}`,
      );
      return [];
    }
  }

  private sanitizeQuestion(rawQuestion: unknown): string {
    if (typeof rawQuestion !== 'string') return '';
    return rawQuestion.trim().slice(0, MAX_QUESTION_LENGTH);
  }

  /**
   * Build lightweight context (for simple tasks)
   */
  async buildLightweightContext(learnerId: string): Promise<Partial<LearnerContext>> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new Error('Learner not found');
    }

    return {
      learnerId,
      age: this.calculateAge(learner.dateOfBirth),
      ageBand: learner.ageBand,
      language: (learner.preferences as any)?.language || 'en',
      displayName: learner.firstName,
    };
  }

  /**
   * Calculate mastery summary
   */
  private calculateMasterySummary(masteryRecords: any[]) {
    const proficientCount = masteryRecords.filter(
      (m) => m.confidence >= 0.75,
    ).length;
    const masteringCount = masteryRecords.filter(
      (m) => m.confidence >= 0.5 && m.confidence < 0.75,
    ).length;
    const needsReviewCount = masteryRecords.filter(
      (m) => m.reviewDue && m.reviewDue <= new Date(),
    ).length;

    // Get top 3 strengths (highest confidence)
    const strengths = masteryRecords
      .filter((m) => m.confidence >= 0.75)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map((m) => m.competency.name);

    // Get areas needing support (low confidence but practiced)
    const struggles = masteryRecords
      .filter((m) => m.confidence < 0.5 && m.evidenceCount > 2)
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 3)
      .map((m) => m.competency.name);

    return {
      totalCompetencies: masteryRecords.length,
      proficientCount,
      masteringCount,
      needsReviewCount,
      strengths,
      struggles,
    };
  }

  /**
   * Calculate recent performance summary
   */
  private calculatePerformanceSummary(evidence: any[]) {
    if (evidence.length === 0) {
      return {
        successRate: 0,
        activitiesCompleted: 0,
        hintsUsed: 0,
        commonErrors: [],
        lastPracticeDate: new Date(),
      };
    }

    const successCount = evidence.filter((e) => e.success).length;
    const successRate = successCount / evidence.length;

    // Identify common error patterns (simplified - in production this would be more sophisticated)
    const errorTypes = new Set<string>();
    evidence
      .filter((e) => !e.success && e.context)
      .forEach((e) => {
        if (e.context.errorType) {
          errorTypes.add(e.context.errorType);
        }
      });

    const mostRecentEvidence = evidence.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    return {
      successRate,
      activitiesCompleted: evidence.length,
      hintsUsed: 0, // Would track this separately
      commonErrors: Array.from(errorTypes),
      lastPracticeDate: mostRecentEvidence.createdAt,
    };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) {
      return 10; // Default fallback
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
