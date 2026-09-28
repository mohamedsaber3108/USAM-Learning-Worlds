import { MissionsService } from './missions.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';

/**
 * Coding vertical-slice integration (canonical spine proof).
 *
 * Proves the SEEDED coding activities flow through the SHARED mission engine
 * exactly like English/Math: submitting a coding CODE / SELECT activity is
 * evaluated by the real ActivityEvaluator, persists an ActivityAttempt, and
 * records Evidence against the CODING COMPETENCY id — turning Coding from a
 * catalog island into a real spine domain.
 *
 * Uses the REAL ActivityEvaluator. Prisma + mastery are stubbed (repo
 * convention). Live DB persistence is verified separately at deploy time by
 * seeding and querying evidence/mastery rows.
 */

// Mirrors seed-coding-vertical-slice.ts.
const CODING_COMPETENCY_ID = 'coding-competency-loops-intro';

const SELECT_ACTIVITY = {
  id: 'coding-act-loops-which-keyword',
  type: 'SELECT',
  title: 'Which keyword repeats an action?',
  assessmentPurpose: 'FORMATIVE',
  content: {
    question: 'Which keyword do we use to repeat an action several times?',
    options: ['for', 'color', 'print', 'banana'],
    correctAnswers: ['for'],
  },
  objective: { competencyId: CODING_COMPETENCY_ID, name: 'obj', competency: { id: CODING_COMPETENCY_ID } },
};

const CODE_ACTIVITY = {
  id: 'coding-act-loops-print-1-to-3',
  type: 'CODE',
  title: 'Print the numbers 1 to 3 with a loop',
  assessmentPurpose: 'FORMATIVE',
  content: {
    prompt: 'Use a for loop to print the numbers 1, 2 and 3.',
    requiredKeywords: ['for', 'print'],
  },
  objective: { competencyId: CODING_COMPETENCY_ID, name: 'obj', competency: { id: CODING_COMPETENCY_ID } },
};

function makeService(activity: any, recordEvidence: jest.Mock) {
  const prisma: any = {
    missionRun: {
      findUnique: jest.fn().mockResolvedValue({ id: 'run1', learnerId: 'ME', missionId: 'coding-mission-first-loops', status: 'IN_PROGRESS' }),
    },
    missionActivity: {
      findUnique: jest.fn().mockResolvedValue({ id: 'ma1', missionId: 'coding-mission-first-loops', activityId: activity.id }),
    },
    activity: { findUnique: jest.fn().mockResolvedValue(activity) },
    activityAttempt: {
      create: jest.fn().mockImplementation(({ data }: any) => ({ id: 'attempt1', ...data })),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };
  const mastery: any = { recordEvidence };
  const noop: any = { recordSignal: jest.fn(), recordWrongAnswer: jest.fn(), evaluateAfterAttempt: jest.fn() };
  const service = new MissionsService(
    prisma,
    mastery,
    new ActivityEvaluator(), // REAL
    noop, noop, noop,
    { emitMissionMilestone: jest.fn() } as any,
    { awardXP: jest.fn() } as any,
    { assertCanStartMission: jest.fn().mockResolvedValue({ allowed: true }) } as any,
  );
  return { service };
}

describe('Coding vertical slice — shared spine wiring', () => {
  it('a correct SELECT answer records KNOWLEDGE evidence against the coding competency', async () => {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const { service } = makeService(SELECT_ACTIVITY, recordEvidence);

    const result = await service.submitActivity('ME', 'run1', SELECT_ACTIVITY.id, { selectedAnswers: ['for'] });

    expect(result.evaluation.correct).toBe(true);
    const [learnerId, competencyId, evidenceType, correct] = recordEvidence.mock.calls[0];
    expect(learnerId).toBe('ME');
    expect(competencyId).toBe(CODING_COMPETENCY_ID);
    expect(evidenceType).toBe('KNOWLEDGE'); // SELECT → KNOWLEDGE
    expect(correct).toBe(true);
  });

  it('a correct CODE answer (has required keywords) records CREATION evidence against the coding competency', async () => {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const { service } = makeService(CODE_ACTIVITY, recordEvidence);

    const result = await service.submitActivity('ME', 'run1', CODE_ACTIVITY.id, {
      code: 'for i in range(1, 4):\n    print(i)',
    });

    expect(result.evaluation.correct).toBe(true);
    const [, competencyId, evidenceType, correct] = recordEvidence.mock.calls[0];
    expect(competencyId).toBe(CODING_COMPETENCY_ID);
    expect(evidenceType).toBe('CREATION'); // CODE → CREATION
    expect(correct).toBe(true);
  });

  it('a CODE answer missing required keywords records unsuccessful evidence', async () => {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const { service } = makeService(CODE_ACTIVITY, recordEvidence);

    const result = await service.submitActivity('ME', 'run1', CODE_ACTIVITY.id, { code: 'x = 5' });

    expect(result.evaluation.correct).toBe(false);
    const [, competencyId, , correct] = recordEvidence.mock.calls[0];
    expect(competencyId).toBe(CODING_COMPETENCY_ID);
    expect(correct).toBe(false);
  });
});
