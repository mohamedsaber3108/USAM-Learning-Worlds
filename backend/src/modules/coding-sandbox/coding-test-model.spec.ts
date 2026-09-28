import {
  parseExerciseSpec,
  gradeAgainstSpec,
  CODING_TEST_MODEL_VERSION,
  type CodingExerciseSpec,
} from './coding-test-model';

describe('coding test model — parseExerciseSpec', () => {
  it('parses a full v1 spec with function-call + hidden tests', () => {
    const spec = parseExerciseSpec({
      testModelVersion: 1,
      language: 'python',
      prompt: 'Write add(a,b)',
      starterCode: 'def add(a, b):\n    pass',
      timeoutMs: 5000,
      executionPolicy: 'FORMATIVE',
      tests: [
        { id: 't1', description: 'add(1,2)=3', kind: 'function-call', functionName: 'add', args: [1, 2], expectedReturn: 3 },
        { id: 't2', description: 'hidden add(10,5)=15', hidden: true, kind: 'function-call', functionName: 'add', args: [10, 5], expectedReturn: 15 },
      ],
    });
    expect(spec.language).toBe('python');
    expect(spec.runner).toBe('pyodide');
    expect(spec.executionPolicy).toBe('FORMATIVE');
    expect(spec.timeoutMs).toBe(5000);
    expect(spec.tests).toHaveLength(2);
    expect(spec.tests[1].hidden).toBe(true);
  });

  it('upconverts legacy assertions to tests (backward compatible)', () => {
    const spec = parseExerciseSpec({
      language: 'python',
      starterCode: '',
      assertions: [
        { id: 'a1', description: 'prints hi', type: 'stdout-equals', expected: 'hi' },
        { id: 'a2', description: 'returns 5', type: 'result-equals', expected: '5' },
      ],
    });
    expect(spec.tests).toHaveLength(2);
    expect(spec.tests[0].kind).toBe('stdout-equals');
    expect(spec.tests[0].expectedOutput).toBe('hi');
    expect(spec.tests[1].kind).toBe('result-equals');
    expect(spec.tests[1].expectedReturn).toBe('5');
    expect(spec.testModelVersion).toBe(CODING_TEST_MODEL_VERSION);
  });

  it('defaults runner from language and policy to FORMATIVE', () => {
    const js = parseExerciseSpec({ language: 'javascript', tests: [] });
    expect(js.runner).toBe('sandpack');
    expect(js.executionPolicy).toBe('FORMATIVE');
    const blockly = parseExerciseSpec({ language: 'python', runner: 'blockly', tests: [] });
    expect(blockly.runner).toBe('blockly');
  });

  it('rejects an invalid test kind', () => {
    expect(() => parseExerciseSpec({ tests: [{ id: 'x', kind: 'nope' }] })).toThrow(/invalid kind/);
  });

  it('rejects function-call test without functionName/args', () => {
    expect(() =>
      parseExerciseSpec({ tests: [{ id: 'x', kind: 'function-call', expectedReturn: 1 }] }),
    ).toThrow(/function-call/);
  });

  it('rejects too many tests', () => {
    const tests = Array.from({ length: 51 }, (_, i) => ({
      id: `t${i}`,
      kind: 'stdout-equals',
      expectedOutput: 'x',
    }));
    expect(() => parseExerciseSpec({ tests })).toThrow(/too many tests/);
  });

  it('clamps an absurd timeout to the default', () => {
    const spec = parseExerciseSpec({ tests: [], timeoutMs: 999_999 });
    expect(spec.timeoutMs).toBe(8000);
  });
});

describe('coding test model — gradeAgainstSpec (server re-validation)', () => {
  const spec: CodingExerciseSpec = parseExerciseSpec({
    language: 'python',
    starterCode: '',
    tests: [
      { id: 't1', description: 'add(1,2)=3', kind: 'function-call', functionName: 'add', args: [1, 2], expectedReturn: 3 },
      { id: 't2', description: 'add(10,5)=15', hidden: true, kind: 'function-call', functionName: 'add', args: [10, 5], expectedReturn: 15 },
      { id: 't3', description: 'prints done', kind: 'stdout-equals', expectedOutput: 'done' },
    ],
  });

  it('all tests pass when reported actuals match the spec', () => {
    const g = gradeAgainstSpec(spec, [
      { id: 't1', description: '', hidden: false, passed: true, actual: '3' },
      { id: 't2', description: '', hidden: true, passed: true, actual: '15' },
      { id: 't3', description: '', hidden: false, passed: true, actual: 'done' },
    ]);
    expect(g.passed).toBe(true);
    expect(g.score).toBe(1);
    expect(g.testsPassed).toBe(3);
    expect(g.testsTotal).toBe(3);
  });

  it('partial pass computes a fractional score', () => {
    const g = gradeAgainstSpec(spec, [
      { id: 't1', description: '', hidden: false, passed: true, actual: '3' },
      { id: 't2', description: '', hidden: true, passed: true, actual: '99' }, // wrong
      { id: 't3', description: '', hidden: false, passed: true, actual: 'done' },
    ]);
    expect(g.passed).toBe(false);
    expect(g.testsPassed).toBe(2);
    expect(g.score).toBeCloseTo(2 / 3);
  });

  it('does NOT trust a client that flips passed=true with wrong actual output', () => {
    // Client claims all passed but the reported actuals are wrong — server
    // recomputes from `actual` and marks them failed.
    const g = gradeAgainstSpec(spec, [
      { id: 't1', description: '', hidden: false, passed: true, actual: '999' },
      { id: 't2', description: '', hidden: true, passed: true, actual: '999' },
      { id: 't3', description: '', hidden: false, passed: true, actual: 'WRONG' },
    ]);
    expect(g.passed).toBe(false);
    expect(g.testsPassed).toBe(0);
    expect(g.score).toBe(0);
  });

  it('a missing reported outcome counts as failed', () => {
    const g = gradeAgainstSpec(spec, [
      { id: 't1', description: '', hidden: false, passed: true, actual: '3' },
      // t2, t3 not reported
    ]);
    expect(g.testsPassed).toBe(1);
    expect(g.passed).toBe(false);
  });

  it('empty test list is a spec error: score 0, not passed', () => {
    const empty = parseExerciseSpec({ tests: [] });
    const g = gradeAgainstSpec(empty, []);
    expect(g.passed).toBe(false);
    expect(g.score).toBe(0);
  });
});
