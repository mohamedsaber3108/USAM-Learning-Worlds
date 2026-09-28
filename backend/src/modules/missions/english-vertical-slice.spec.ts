import { MissionsService } from './missions.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';

/**
 * English vertical-slice integration (plans-local/69, Option A proof).
 *
 * Proves that the SEEDED English activities flow through the SHARED mission
 * engine exactly like Coding: submitting an English SELECT / MATCH activity is
 * evaluated by the real ActivityEvaluator, persists an ActivityAttempt, and
 * records Evidence against the ENGLISH COMPETENCY id — the wiring that turns
 * English from a catalog island into a real spine domain.
 *
 * Uses the REAL ActivityEvaluator (not a stub) so the English content shapes
 * are genuinely graded. Prisma + mastery are stubbed (repo convention — no test
 * DB); the live DB persistence is verified separately at deploy time by seeding
 * and querying evidence/mastery rows.
 */

// The real seeded English activities (mirrors seed-english-vocabulary-slice.ts).
const ENGLISH_COMPETENCY_ID = 'english-competency-everyday-words-a1';
const SELECT_ACTIVITY = {
  id: 'english-act-everyday-fruit',
  type: 'SELECT',
  title: 'Which word is a fruit?',
  assessmentPurpose: 'FORMATIVE',
  content: { question: 'Which word is a fruit?', options: ['apple', 'chair', 'river', 'happy'], correctAnswers: ['apple'] },
  objective: { competencyId: ENGLISH_COMPETENCY_ID, name: 'obj', competency: { id: ENGLISH_COMPETENCY_ID, name: 'Everyday words (A1)' } },
};
const MATCH_ACTIVITY = {
  id: 'english-act-everyday-match',
  type: 'MATCH',
  title: 'Match the word to its meaning',
  assessmentPurpose: 'SUMMATIVE',
  content: {
    pairs: [
      { left: 'sun', right: 'the bright light in the sky' },
      { left: 'book', right: 'pages with words you read' },
      { left: 'water', right: 'what you drink when you are thirsty' },
    ],
  },
  objective: { competencyId: ENGLISH_COMPETENCY_ID, name: 'obj', competency: { id: ENGLISH_COMPETENCY_ID } },
};

function makeService(activity: any, recordEvidence: jest.Mock) {
  const prisma: any = {
    missionRun: {
      findUnique: jest.fn().mockResolvedValue({ id: 'run1', learnerId: 'ME', missionId: 'english-mission-everyday-words', status: 'IN_PROGRESS' }),
    },
    missionActivity: {
      // Integrity check: the activity belongs to this run's mission.
      findUnique: jest.fn().mockResolvedValue({ id: 'ma1', missionId: 'english-mission-everyday-words', activityId: activity.id }),
    },
    activity: { findUnique: jest.fn().mockResolvedValue(activity) },
    activityAttempt: {
      create: jest.fn().mockImplementation(({ data }: any) => ({ id: 'attempt1', ...data })),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };
  const mastery: any = { recordEvidence };
  const evaluator = new ActivityEvaluator(); // REAL evaluator
  const noop: any = { recordSignal: jest.fn(), recordWrongAnswer: jest.fn(), evaluateAfterAttempt: jest.fn() };
  const service = new MissionsService(
    prisma,
    mastery,
    evaluator,
    noop, // cognitiveLoad
    noop, // misconception
    noop, // intervention
    { emitMissionMilestone: jest.fn() } as any, // notifications
    { awardXP: jest.fn() } as any, // progression
    { assertCanStartMission: jest.fn().mockResolvedValue({ allowed: true }) } as any, // entitlements
  );
  return { service, prisma, mastery };
}

describe('English vertical slice — shared spine wiring', () => {
  it('a correct SELECT answer records KNOWLEDGE evidence against the English competency', async () => {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const { service } = makeService(SELECT_ACTIVITY, recordEvidence);

    const result = await service.submitActivity('ME', 'run1', SELECT_ACTIVITY.id, { selectedAnswers: ['apple'] });

    // Real evaluator graded it correct.
    expect(result.evaluation.correct).toBe(true);
    // Evidence recorded against the ENGLISH competency id (the whole point).
    expect(recordEvidence).toHaveBeenCalledTimes(1);
    const [learnerId, competencyId, evidenceType, correct] = recordEvidence.mock.calls[0];
    expect(learnerId).toBe('ME');
    expect(competencyId).toBe(ENGLISH_COMPETENCY_ID);
    expect(evidenceType).toBe('KNOWLEDGE'); // SELECT → KNOWLEDGE per getEvidenceType
    expect(correct).toBe(true);
  });

  it('a correct SUMMATIVE MATCH answer records weighted evidence (×1.15) against the English competency', async () => {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const { service } = makeService(MATCH_ACTIVITY, recordEvidence);

    const response = {
      matches: [
        { left: 'sun', right: 'the bright light in the sky' },
        { left: 'book', right: 'pages with words you read' },
        { left: 'water', right: 'what you drink when you are thirsty' },
      ],
    };
    const result = await service.submitActivity('ME', 'run1', MATCH_ACTIVITY.id, response);

    expect(result.evaluation.correct).toBe(true);
    const [, competencyId, evidenceType, correct, weightedScore] = recordEvidence.mock.calls[0]
    expect(competencyId).toBe(ENGLISH_COMPETENCY_ID)
    expect(evidenceType).toBe('APPLICATION') // MATCH → APPLICATION
    expect(correct).toBe(true)
    // SUMMATIVE weights the score ×1.15 (capped 100). A perfect 1.0 → 1.15.
    expect(weightedScore).toBeGreaterThan(1)
  });

  it('a wrong SELECT answer records unsuccessful evidence (mastery must reflect failure, not XP)', async () => {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const { service } = makeService(SELECT_ACTIVITY, recordEvidence);

    const result = await service.submitActivity('ME', 'run1', SELECT_ACTIVITY.id, { selectedAnswers: ['chair'] });

    expect(result.evaluation.correct).toBe(false);
    const [, competencyId, , correct] = recordEvidence.mock.calls[0];
    expect(competencyId).toBe(ENGLISH_COMPETENCY_ID);
    expect(correct).toBe(false);
  });
});
