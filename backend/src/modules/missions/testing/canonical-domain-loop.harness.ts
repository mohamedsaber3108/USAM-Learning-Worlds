/**
 * Reusable canonical-domain learning-loop test harness.
 *
 * The English vertical slice proved the shared spine end-to-end
 * (Domain→…→Mission→Attempt→Evidence→Mastery→Review). This harness turns that
 * one-off proof into a PARAMETERIZABLE regression contract so every domain that
 * plugs into the shared engine is held to the same standard:
 *
 *   START → ACTIVITY → ATTEMPT → EVIDENCE → MASTERY → REVIEW → RECOMMENDATION
 *
 * It exercises the REAL engine pieces that are DB-independent:
 *   - MissionsService.submitActivity + the real ActivityEvaluator  (ATTEMPT + EVIDENCE)
 *   - the real MasteryConfidenceAlgorithm                          (MASTERY + REVIEW)
 * Prisma + the mastery queue are stubbed (repo convention — no test DB). Live DB
 * persistence is proven separately at deploy time per domain (see STATUS / matrix).
 *
 * Add a domain by writing a CanonicalDomainLoopCase fixture and passing it to
 * runCanonicalDomainLoop(). See canonical-domain-loop.spec.ts for English + Coding.
 */
import { MissionsService } from '../missions.service';
import { ActivityEvaluator } from '../evaluators/activity-evaluator';
import { MasteryConfidenceAlgorithm } from '../../mastery/mastery-confidence.algorithm';

export interface CanonicalDomainLoopCase {
  /** Human label, e.g. "English / Vocabulary A1". */
  domain: string;
  /** The mission the learner starts (id only — used for run/integrity wiring). */
  missionId: string;
  /** Stable test learner id. */
  learnerId: string;
  /** The competency evidence MUST be recorded against. */
  expectedCompetency: string;
  /** The EvidenceType the evaluator should map this activity to. */
  expectedEvidenceType: string;
  /**
   * The activity under test. Shape mirrors what the engine loads from Prisma:
   * id, type, assessmentPurpose, content, and objective.competencyId.
   */
  activity: {
    id: string;
    type: string;
    assessmentPurpose?: string;
    content: any;
  };
  /** A response the real evaluator grades CORRECT. */
  correctResponse: any;
  /** A response the real evaluator grades INCORRECT. */
  incorrectResponse: any;
}

/** Build a MissionsService wired with the real evaluator and stubbed Prisma. */
function makeService(c: CanonicalDomainLoopCase, recordEvidence: jest.Mock) {
  const activity = {
    ...c.activity,
    objective: {
      competencyId: c.expectedCompetency,
      name: 'obj',
      competency: { id: c.expectedCompetency },
    },
  };
  const prisma: any = {
    missionRun: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'run1',
        learnerId: c.learnerId,
        missionId: c.missionId,
        status: 'IN_PROGRESS',
      }),
    },
    missionActivity: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'ma1',
        missionId: c.missionId,
        activityId: c.activity.id,
      }),
    },
    activity: { findUnique: jest.fn().mockResolvedValue(activity) },
    activityAttempt: {
      create: jest.fn().mockImplementation(({ data }: any) => ({ id: 'attempt1', ...data })),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };
  const mastery: any = { recordEvidence };
  const noop: any = {
    recordSignal: jest.fn(),
    recordWrongAnswer: jest.fn(),
    evaluateAfterAttempt: jest.fn(),
  };
  const service = new MissionsService(
    prisma,
    mastery,
    new ActivityEvaluator(), // REAL
    noop, // cognitiveLoad
    noop, // misconception
    noop, // intervention
    { emitMissionMilestone: jest.fn() } as any, // notifications
    { awardXP: jest.fn() } as any, // progression
    { assertCanStartMission: jest.fn().mockResolvedValue({ allowed: true }) } as any, // entitlements
  );
  return { service, prisma };
}

/**
 * Registers the canonical-loop describe block for one domain. Call inside a
 * spec file. Asserts every stage of the shared spine.
 */
export function runCanonicalDomainLoop(c: CanonicalDomainLoopCase) {
  describe(`Canonical domain loop — ${c.domain}`, () => {
    it('ATTEMPT + EVIDENCE: a correct answer records the right evidence against the right competency', async () => {
      const recordEvidence = jest.fn().mockResolvedValue(undefined);
      const { service, prisma } = makeService(c, recordEvidence);

      const result = await service.submitActivity(
        c.learnerId,
        'run1',
        c.activity.id,
        c.correctResponse,
      );

      // ATTEMPT persisted for this run + activity.
      expect(prisma.activityAttempt.create).toHaveBeenCalledTimes(1);
      // Evaluated correct by the REAL evaluator.
      expect(result.evaluation.correct).toBe(true);
      // EVIDENCE against the expected competency + type.
      expect(recordEvidence).toHaveBeenCalledTimes(1);
      const [learnerId, competencyId, evidenceType, correct] = recordEvidence.mock.calls[0];
      expect(learnerId).toBe(c.learnerId);
      expect(competencyId).toBe(c.expectedCompetency);
      expect(evidenceType).toBe(c.expectedEvidenceType);
      expect(correct).toBe(true);
    });

    it('EVIDENCE reflects failure: a wrong answer records unsuccessful evidence (no false mastery)', async () => {
      const recordEvidence = jest.fn().mockResolvedValue(undefined);
      const { service } = makeService(c, recordEvidence);

      const result = await service.submitActivity(
        c.learnerId,
        'run1',
        c.activity.id,
        c.incorrectResponse,
      );

      expect(result.evaluation.correct).toBe(false);
      const [, competencyId, , correct] = recordEvidence.mock.calls[0];
      expect(competencyId).toBe(c.expectedCompetency);
      expect(correct).toBe(false);
    });

    it('MASTERY + REVIEW: correct evidence raises confidence, advances state, and schedules a review', () => {
      const algo = new MasteryConfidenceAlgorithm();

      // One successful piece of evidence of the expected type (mirrors what
      // recordEvidence would persist, then feed to recalculateMastery).
      const evidence: any[] = [
        { type: c.expectedEvidenceType, success: true, score: 1, createdAt: new Date() },
      ];
      const confidence = algo.calculate(evidence);
      const state = algo.determineState(confidence);
      const reviewDue = algo.calculateNextReview(confidence, new Date());

      // MASTERY moved off the floor.
      expect(confidence).toBeGreaterThan(0);
      expect(state).not.toBe('NOT_STARTED');
      // REVIEW scheduled in the future — this is what the recommendation/review
      // surface consumes to decide the learner's next action.
      expect(reviewDue.getTime()).toBeGreaterThan(Date.now());
    });

    it('RECOMMENDATION: failure keeps confidence low so the competency stays in the practice pool', () => {
      const algo = new MasteryConfidenceAlgorithm();
      const failing: any[] = [
        { type: c.expectedEvidenceType, success: false, score: 0, createdAt: new Date() },
      ];
      const confidence = algo.calculate(failing);
      const state = algo.determineState(confidence);
      // A failed attempt must NOT produce a mastered/proficient state — the
      // recommendation engine should keep surfacing this competency.
      expect(['PROFICIENT', 'MASTERED']).not.toContain(state);
    });
  });
}
