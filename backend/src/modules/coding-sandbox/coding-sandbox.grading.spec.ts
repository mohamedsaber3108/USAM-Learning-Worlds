import { CodingSandboxService, SubmitResultDto } from './coding-sandbox.service';

/**
 * Server-side grading path (task #6/#10): proves submitResult parses the
 * authoritative test spec from the Activity, RE-VALIDATES the client-reported
 * outcomes with gradeAgainstSpec (client `passed` is never trusted), persists
 * an ActivityAttempt, and records rich Evidence.context via the shared mastery
 * engine. The service never executes code.
 */
describe('CodingSandboxService — server-side grading', () => {
  const ACTIVITY = {
    id: 'coding-act-loops-print-1-to-3',
    type: 'CODE',
    title: 'Print 1..3',
    description: 'loop',
    objectiveId: 'obj-1',
    objective: { competencyId: 'coding-competency-loops-intro', competency: { id: 'coding-competency-loops-intro' } },
    content: {
      testModelVersion: 1,
      language: 'python',
      prompt: 'print 1,2,3',
      starterCode: '',
      executionPolicy: 'FORMATIVE',
      tests: [
        { id: 't1', description: 'prints 1\\n2\\n3', kind: 'stdout-equals', expectedOutput: '1\n2\n3' },
        { id: 't2', description: 'contains 2', kind: 'stdout-contains', expectedOutput: '2' },
      ],
    },
  };

  function makeService() {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const created: any[] = [];
    const prisma: any = {
      missionRun: { findUnique: jest.fn().mockResolvedValue({ id: 'run-1', learnerId: 'ME' }) },
      activity: { findUnique: jest.fn().mockResolvedValue(ACTIVITY) },
      activityAttempt: {
        create: jest.fn().mockImplementation(({ data }: any) => {
          const row = { id: `attempt-${created.length + 1}`, ...data };
          created.push(row);
          return row;
        }),
      },
    };
    const mastery: any = { recordEvidence };
    const coach: any = { reviewCode: jest.fn().mockResolvedValue({ feedback: 'nice loop' }) };
    const svc = new CodingSandboxService(prisma, mastery, coach);
    return { svc, prisma, recordEvidence, created };
  }

  const base: SubmitResultDto = {
    runId: 'run-1',
    activityId: 'coding-act-loops-print-1-to-3',
    code: 'for i in range(1,4):\n    print(i)',
    language: 'python',
    stdout: '1\n2\n3',
  };

  it('grades all-pass and records CREATION evidence with rich context', async () => {
    const { svc, recordEvidence, created } = makeService();
    const res = await svc.submitResult('ME', {
      ...base,
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
        { id: 't2', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
      ],
      hintsUsed: 1,
      attemptNumber: 2,
    });

    expect(res.passed).toBe(true);
    expect(res.score).toBe(1);
    expect(res.testsPassed).toBe(2);
    expect(res.testsTotal).toBe(2);

    // Attempt persisted with server-authoritative outcomes.
    expect(created[0].success).toBe(true);
    expect(created[0].response.executedBy).toBe('pyodide');

    // Evidence recorded against the coding competency with rich context.
    const [learnerId, competencyId, type, passed, score, context] = recordEvidence.mock.calls[0];
    expect(learnerId).toBe('ME');
    expect(competencyId).toBe('coding-competency-loops-intro');
    expect(type).toBe('CREATION');
    expect(passed).toBe(true);
    expect(score).toBe(1);
    expect(context).toMatchObject({
      language: 'python',
      executionPolicy: 'FORMATIVE',
      testModelVersion: 1,
      testsPassed: 2,
      testsTotal: 2,
      hintsUsed: 1,
      attemptNumber: 2,
    });
  });

  it('does NOT trust client passed=true with wrong actual output', async () => {
    const { svc, recordEvidence } = makeService();
    const res = await svc.submitResult('ME', {
      ...base,
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: 'WRONG' },
        { id: 't2', description: '', hidden: false, passed: true, actual: 'WRONG' },
      ],
    });
    expect(res.passed).toBe(false);
    expect(res.score).toBe(0);
    const [, , , passed] = recordEvidence.mock.calls[0];
    expect(passed).toBe(false);
  });

  it('partial pass yields a fractional score', async () => {
    const { svc } = makeService();
    const res = await svc.submitResult('ME', {
      ...base,
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
        { id: 't2', description: '', hidden: false, passed: true, actual: 'nope' },
      ],
    });
    expect(res.passed).toBe(false);
    expect(res.testsPassed).toBe(1);
    expect(res.score).toBeCloseTo(0.5);
  });

  it('a timed-out submission fails regardless of reported outcomes', async () => {
    const { svc } = makeService();
    const res = await svc.submitResult('ME', {
      ...base,
      timedOut: true,
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
        { id: 't2', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
      ],
    });
    expect(res.passed).toBe(false);
    expect(res.score).toBe(0);
  });
});
