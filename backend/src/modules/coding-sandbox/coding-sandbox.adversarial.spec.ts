import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CodingSandboxService, SANDBOX_LIMITS, SubmitResultDto } from './coding-sandbox.service';

/**
 * Adversarial regression suite for the CLIENT-EXECUTED / SERVER-VALIDATED trust
 * boundary (plans 74/75, phase task #2). Enumerates the 10 attack cases and
 * pins the server's authoritative behavior.
 *
 * TRUST MODEL (verified by these tests):
 *  - The server loads the authoritative spec from the Activity row by
 *    activityId (never from the request) — expected values, runner,
 *    executionPolicy, testModelVersion all come from the DB.
 *  - The server RECOMPUTES passed/score/testsPassed/testsTotal from the reported
 *    `actual` vs the DB spec. Client-reported passed/testsPassed/runner/version
 *    are IGNORED.
 *  - The server TRUSTS the reported `actual`/stdout/code (it cannot re-run the
 *    code — this is the honest FORMATIVE limitation): a client that fabricates
 *    an `actual` that MATCHES the real expected output passes. Defeating that
 *    needs the CREDENTIAL tier (isolated server execution), a documented future
 *    phase.
 */
describe('CodingSandboxService — adversarial trust-model regression', () => {
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
      runner: 'pyodide',
      executionPolicy: 'FORMATIVE',
      prompt: 'print 1,2,3',
      starterCode: '',
      tests: [
        { id: 't1', description: 'prints 1\\n2\\n3', kind: 'stdout-equals', expectedOutput: '1\n2\n3' },
        { id: 'h1', description: 'hidden contains 2', hidden: true, kind: 'stdout-contains', expectedOutput: '2' },
      ],
    },
  };

  function makeService(overrides: any = {}) {
    const recordEvidence = jest.fn().mockResolvedValue(undefined);
    const prisma: any = {
      missionRun: {
        findUnique: jest.fn().mockResolvedValue({ id: 'run-1', learnerId: 'ME', missionId: 'mission-1' }),
      },
      missionActivity: { findFirst: jest.fn().mockResolvedValue({ id: 'ma-1' }) },
      activity: { findUnique: jest.fn().mockResolvedValue(ACTIVITY) },
      activityAttempt: {
        create: jest.fn().mockImplementation(({ data }: any) => ({ id: 'attempt-1', ...data })),
      },
      ...overrides.prisma,
    };
    const mastery: any = { recordEvidence };
    const coach: any = { reviewCode: jest.fn().mockResolvedValue({ feedback: 'ok' }) };
    return { svc: new CodingSandboxService(prisma, mastery, coach), prisma, recordEvidence };
  }

  const base: SubmitResultDto = {
    runId: 'run-1',
    activityId: 'coding-act-loops-print-1-to-3',
    code: 'for i in range(1,4):\n    print(i)',
    language: 'python',
    stdout: '1\n2\n3',
  };

  // 1. passed=true + wrong actual -> server recomputes from actual -> fail
  it('#1 rejects passed=true with wrong actual', async () => {
    const { svc } = makeService();
    const r = await svc.submitResult('ME', {
      ...base,
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: 'WRONG' },
        { id: 'h1', description: '', hidden: true, passed: true, actual: 'WRONG' },
      ],
    });
    expect(r.passed).toBe(false);
    expect(r.score).toBe(0);
  });

  // 2. forged testsPassed/testsTotal in the payload -> server ignores, recomputes
  it('#2 ignores forged testsPassed/testsTotal (not part of the contract)', async () => {
    const { svc } = makeService();
    const r = await svc.submitResult('ME', {
      ...(base as any),
      testsPassed: 999,
      testsTotal: 999,
      testOutcomes: [{ id: 't1', description: '', hidden: false, passed: true, actual: 'nope' }],
    } as any);
    // Server-computed, not the forged 999/999.
    expect(r.testsTotal).toBe(2);
    expect(r.passed).toBe(false);
  });

  // 3. forged expected output in the payload -> server uses DB spec's expected
  it('#3 ignores a forged expected value in the request (uses DB spec)', async () => {
    const { svc } = makeService();
    const r = await svc.submitResult('ME', {
      ...(base as any),
      // Attacker tries to redefine the test to expect their wrong output.
      tests: [{ id: 't1', kind: 'stdout-equals', expectedOutput: 'WRONG' }],
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: 'WRONG' },
        { id: 'h1', description: '', hidden: true, passed: true, actual: 'WRONG' },
      ],
    } as any);
    // DB spec expects '1\n2\n3', so 'WRONG' fails.
    expect(r.passed).toBe(false);
  });

  // 4. forged hidden-test result matching the (unknown-to-client) expected still
  //    only passes if actual truly matches — a fabricated hidden `actual` that
  //    happens to match expected passes (documented FORMATIVE limitation), but a
  //    wrong hidden actual fails even if client claims passed=true.
  it('#4 hidden test graded on actual vs DB expected, not client passed', async () => {
    const { svc } = makeService();
    const r = await svc.submitResult('ME', {
      ...base,
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
        { id: 'h1', description: '', hidden: true, passed: true, actual: 'no-two-here' },
      ],
    });
    // hidden expects contains '2'; 'no-two-here' has no '2' -> hidden fails.
    expect(r.passed).toBe(false);
    expect(r.testsPassed).toBe(1);
  });

  // 5. forged activity/test-model version -> server loads spec from DB, ignores
  it('#5 ignores forged testModelVersion/runner in the request', async () => {
    const { svc, recordEvidence } = makeService();
    await svc.submitResult('ME', {
      ...(base as any),
      testModelVersion: 999,
      runner: 'evil-runner',
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
        { id: 'h1', description: '', hidden: true, passed: true, actual: '1\n2\n3' },
      ],
    } as any);
    const [, , , , , context] = recordEvidence.mock.calls[0];
    expect(context.testModelVersion).toBe(1); // from DB spec
    expect(context.runner).toBe('pyodide'); // from DB spec, not 'evil-runner'
  });

  // 6. correct output with completely unrelated source code -> still graded on
  //    output (FORMATIVE: server can't run the code; documented). Passes.
  it('#6 correct output with unrelated source passes (documented FORMATIVE limit)', async () => {
    const { svc } = makeService();
    const r = await svc.submitResult('ME', {
      ...base,
      code: '# totally unrelated\nx = 1',
      testOutcomes: [
        { id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' },
        { id: 'h1', description: '', hidden: true, passed: true, actual: '1\n2\n3' },
      ],
    });
    // Honest limitation: output matches -> passes. (CREDENTIAL tier would re-run.)
    expect(r.passed).toBe(true);
  });

  // 7. source changed after execution -> only the submitted code+outcomes are
  //    graded together; there is no separate "execution record" to diverge from.
  //    Documented: the pairing of code<->outcomes is client-asserted (FORMATIVE).
  it('#7 grades the submitted code+outcomes as one unit (no separate exec record)', async () => {
    const { svc } = makeService();
    const r = await svc.submitResult('ME', {
      ...base,
      code: 'print("edited after running")',
      testOutcomes: [{ id: 't1', description: '', hidden: false, passed: true, actual: 'wrong' }],
    });
    expect(r.passed).toBe(false); // actual is wrong -> fails regardless of code text
  });

  // 8. result replayed against ANOTHER activity (not in this run's mission) -> reject
  it('#8 rejects an activity that does not belong to the run mission', async () => {
    const { svc } = makeService({
      prisma: { missionActivity: { findFirst: jest.fn().mockResolvedValue(null) } },
    });
    await expect(
      svc.submitResult('ME', {
        ...base,
        activityId: 'some-other-activity',
        testOutcomes: [{ id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // 9. result replayed against ANOTHER learner's run -> reject (ownership)
  it('#9 rejects a run owned by a different learner', async () => {
    const { svc } = makeService({
      prisma: { missionRun: { findUnique: jest.fn().mockResolvedValue({ id: 'run-1', learnerId: 'SOMEONE_ELSE', missionId: 'mission-1' }) } },
    });
    await expect(
      svc.submitResult('ME', {
        ...base,
        testOutcomes: [{ id: 't1', description: '', hidden: false, passed: true, actual: '1\n2\n3' }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // 10. oversized submission -> reject before any DB work
  it('#10 rejects an oversized submission', async () => {
    const { svc } = makeService();
    await expect(
      svc.submitResult('ME', { ...base, code: 'x'.repeat(SANDBOX_LIMITS.MAX_CODE_CHARS + 1) }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // Hidden-test expected values must NOT be sent to the browser.
  it('getMission strips hidden tests expected values (truly hidden)', async () => {
    const { svc } = makeService();
    const spec = await svc.getMission('coding-act-loops-print-1-to-3');
    const visible = spec.tests.find((t: any) => t.id === 't1');
    const hidden = spec.tests.find((t: any) => t.id === 'h1');
    // Visible test keeps its expected (shown as a worked example).
    expect((visible as any).expectedOutput).toBe('1\n2\n3');
    // Hidden test is sent WITHOUT its expected value.
    expect((hidden as any).expectedOutput).toBeUndefined();
    expect((hidden as any).hidden).toBe(true);
    expect((hidden as any).kind).toBe('stdout-contains'); // still runnable
  });
});
