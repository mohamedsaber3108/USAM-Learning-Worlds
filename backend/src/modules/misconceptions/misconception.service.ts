import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MISCONCEPTION_SEED_SIGNATURES } from './misconception-seed-data';

/**
 * Misconception Engine v1.
 *
 * Called from MissionsService.submitActivity right after a wrong answer
 * is evaluated (evaluation.correct === false). Two paths:
 *
 *  1) Known-signature match: if the submitted wrong answer's normalized
 *     value matches one of the seeded MISCONCEPTION_SEED_SIGNATURES for a
 *     tag we can infer from the activity/question content, we upsert a
 *     LABELED MisconceptionPattern row (description pre-filled) and
 *     increment frequencyCount.
 *
 *  2) Unknown wrong answer: we upsert an UNLABELED MisconceptionPattern
 *     row (description = null) keyed on the raw wrong-answer value, and
 *     increment frequencyCount. Once frequencyCount reaches 3+, the
 *     pattern is flagged `isLabeled: false` but is now treated as a
 *     "confirmed recurring, pending human review" pattern (surfaced first
 *     in the admin listing) rather than being ignored as noise.
 *
 * This never overwrites/removes a human-written description once one
 * exists — the auto path only ever fills in a *new* row's description
 * from the seed match; it does not touch a previously-labeled row's
 * description via the recurrence path.
 */
@Injectable()
export class MisconceptionService {
  private readonly logger = new Logger(MisconceptionService.name);

  /** Wrong-answer occurrence count at which an unlabeled pattern is
   * considered "confirmed recurring" and worth a human's attention. */
  static readonly RECURRENCE_THRESHOLD = 3;

  constructor(private prisma: PrismaService) {}

  /**
   * Record a wrong-answer submission for misconception tracking.
   *
   * @param wrongAnswerValue - the learner's submitted (incorrect) answer,
   *   pre-normalized to a comparable string by the caller.
   * @param scope - questionTemplateId and/or activityId this attempt
   *   belongs to (at least one should be provided; both may be, since a
   *   generated Activity carries generatedFromTemplateId).
   * @param contentTags - free-text hints (e.g. question stem, objective
   *   name, activity title) used to loosely match a seeded misconception
   *   signature's `matchesTag`.
   */
  async recordWrongAnswer(
    wrongAnswerValue: string,
    scope: { questionTemplateId?: string | null; activityId?: string | null },
    contentTags: string[] = [],
  ) {
    const normalized = this.normalize(wrongAnswerValue);
    if (!normalized) return null;

    const questionTemplateId = scope.questionTemplateId ?? null;
    const activityId = scope.activityId ?? null;
    if (!questionTemplateId && !activityId) {
      this.logger.warn(
        'recordWrongAnswer called without questionTemplateId or activityId — skipping',
      );
      return null;
    }

    const matchedSignature = this.matchSeedSignature(normalized, contentTags);

    // Prisma has no native upsert-with-nullable-composite-unique-key
    // ergonomics for a 3-column @@unique when either FK can be null, so
    // we do a manual find-then-create/increment. Both FKs are stored as
    // literal string or "" placeholder is avoided — Postgres treats NULL
    // != NULL, so we query explicitly by whichever ids are set.
    const existing = await this.prisma.misconceptionPattern.findFirst({
      where: {
        questionTemplateId,
        activityId,
        wrongAnswerValue: normalized,
      },
    });

    if (existing) {
      const updated = await this.prisma.misconceptionPattern.update({
        where: { id: existing.id },
        data: {
          frequencyCount: { increment: 1 },
          lastSeenAt: new Date(),
          // Backfill a label if we now recognize a previously-unlabeled
          // pattern against a seed signature (seed library can grow over
          // time without losing history already collected under it).
          ...(matchedSignature && !existing.isLabeled
            ? { description: matchedSignature.description, isLabeled: true }
            : {}),
        },
      });
      return updated;
    }

    const created = await this.prisma.misconceptionPattern.create({
      data: {
        questionTemplateId,
        activityId,
        wrongAnswerValue: normalized,
        frequencyCount: 1,
        description: matchedSignature?.description ?? null,
        isLabeled: Boolean(matchedSignature),
      },
    });

    return created;
  }

  /**
   * Top misconceptions for a given question template, ordered by
   * frequency (most common first). Confirmed-recurring unlabeled
   * patterns (frequencyCount >= threshold) are surfaced same as labeled
   * ones — they're real signal, just not yet named by a human.
   */
  async getByQuestionTemplate(questionTemplateId: string) {
    return this.listOrdered({ questionTemplateId });
  }

  /**
   * Top misconceptions across all activities/questions tied to a given
   * mission Activity id.
   */
  async getByActivity(activityId: string) {
    return this.listOrdered({ activityId });
  }

  /**
   * Platform-wide top misconceptions, most frequent first, regardless of
   * which question/activity they belong to — the admin overview surface
   * (no scope filter). Includes the question/activity title so the admin
   * doesn't have to cross-reference raw ids.
   */
  async listTopOverall(take = 50) {
    const patterns = await this.prisma.misconceptionPattern.findMany({
      orderBy: [{ frequencyCount: 'desc' }, { lastSeenAt: 'desc' }],
      take,
      include: {
        questionTemplate: { select: { id: true, stem: true } },
        activity: { select: { id: true, title: true } },
      },
    });

    return patterns.map((p) => ({
      ...p,
      isConfirmedRecurring:
        !p.isLabeled && p.frequencyCount >= MisconceptionService.RECURRENCE_THRESHOLD,
    }));
  }

  private async listOrdered(where: {
    questionTemplateId?: string;
    activityId?: string;
  }) {
    const patterns = await this.prisma.misconceptionPattern.findMany({
      where,
      orderBy: [{ frequencyCount: 'desc' }, { lastSeenAt: 'desc' }],
    });

    return patterns.map((p) => ({
      ...p,
      isConfirmedRecurring:
        !p.isLabeled && p.frequencyCount >= MisconceptionService.RECURRENCE_THRESHOLD,
    }));
  }

  private matchSeedSignature(normalizedWrongAnswer: string, contentTags: string[]) {
    const lowerTags = contentTags.map((t) => t.toLowerCase());

    return MISCONCEPTION_SEED_SIGNATURES.find((sig) => {
      const valueMatches = this.normalize(sig.wrongAnswerValue) === normalizedWrongAnswer;
      if (!valueMatches) return false;
      // If no content tags supplied, a value-only match is accepted (best
      // effort); if tags are supplied, require at least a loose textual
      // hint that the tag topic is present (keeps false positives down
      // for generic wrong-answer strings like plain numbers).
      if (lowerTags.length === 0) return true;
      const tagWords = sig.matchesTag.split('-');
      return lowerTags.some((tag) => tagWords.some((w) => tag.includes(w)));
    });
  }

  private normalize(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toString();
    return String(value).toLowerCase().trim().replace(/\s+/g, ' ');
  }
}
