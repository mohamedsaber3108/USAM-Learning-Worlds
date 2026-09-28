/**
 * CODE activity test model + execution-policy contract (audit 74, task #2).
 *
 * The versionable specification for a coding exercise, carried on
 * `Activity.content` (no new Prisma table — content is already Json). It
 * generalizes the original stdout/string assertions into a real test model
 * that supports function-call tests (functionName + args + expectedReturn),
 * stdin/stdout tests, visible vs hidden tests, per-exercise timeout, and an
 * explicit execution policy that encodes the TRUST tier.
 *
 * TRUST MODEL (documented in 74_CODING_EXECUTION_AUDIT.md):
 *  - FORMATIVE: code runs in the learner's browser (Pyodide Worker / Sandpack),
 *    the client runs the tests and reports per-test outcomes, and the SERVER
 *    RE-VALIDATES the reported output/return against the deterministic test
 *    spec. Sufficient for practice + formative mastery. NOT tamper-proof — a
 *    determined client could fabricate output.
 *  - CREDENTIAL: requires isolated SERVER-SIDE execution against hidden tests.
 *    NOT built yet. Evidence from the FORMATIVE path must never be treated as
 *    credential-grade; `executionPolicy` is recorded on the Evidence so
 *    downstream credential logic can distinguish.
 *
 * This module is PURE (no I/O) so it can be unit-tested and shared by the
 * grader. The frontend runner mirrors the same shapes over JSON.
 */

export const CODING_TEST_MODEL_VERSION = 1;

export type SandboxLanguage = 'python' | 'javascript';
export type SandboxRunner = 'pyodide' | 'sandpack' | 'blockly';
export type ExecutionPolicy = 'FORMATIVE' | 'CREDENTIAL';

/**
 * A single test case. `kind` selects how the learner's program is exercised
 * and compared. All comparisons are deterministic string/JSON equality so the
 * server can re-validate the client-reported result without executing code.
 */
export interface CodingTest {
  /** Stable id (referenced in per-test outcomes + feedback). */
  id: string;
  /** Child-facing description of what this test checks. */
  description: string;
  /**
   * hidden tests are NOT shown to the learner before submission (prevents
   * hardcoding to the visible examples) but still count toward the score.
   * Defaults to false (visible).
   */
  hidden?: boolean;
  kind:
    | 'stdout-equals' // program stdout (trimmed) equals `expectedOutput`
    | 'stdout-contains' // program stdout contains `expectedOutput`
    | 'function-call' // call `functionName(...args)`, compare return to `expectedReturn`
    | 'result-equals'; // top-level expression result equals `expectedReturn`
  /** For stdin-driven programs: text piped to stdin before running. */
  stdin?: string;
  /** For stdout-* kinds. */
  expectedOutput?: string;
  /** For function-call kind. */
  functionName?: string;
  args?: unknown[];
  /** For function-call / result-equals kinds. JSON-comparable expected value. */
  expectedReturn?: unknown;
}

/** The full coding exercise spec stored on Activity.content. */
export interface CodingExerciseSpec {
  /** Model version so the shape can evolve without silent breakage. */
  testModelVersion: number;
  language: SandboxLanguage;
  runner: SandboxRunner;
  prompt: string;
  starterCode: string;
  /** Wall-clock cap the browser runner enforces (ms). */
  timeoutMs: number;
  executionPolicy: ExecutionPolicy;
  tests: CodingTest[];
}

/** One test's outcome as reported by the client runner. */
export interface CodingTestOutcome {
  id: string;
  description: string;
  hidden: boolean;
  passed: boolean;
  /** What the learner's program actually produced (for feedback + server re-check). */
  actual?: string;
}

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_TESTS = 50;

/** Normalize a value to the canonical string used for deterministic comparison. */
export function canonical(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Validate + normalize an Activity.content into a CodingExerciseSpec.
 * Throws a plain Error (caller maps to Http) on an invalid/oversized spec so a
 * malformed seed can never silently produce a "no tests => pass" situation.
 *
 * Backward compatible: legacy content that carries `assertions: [{id,
 * description, type: 'stdout-equals'|'stdout-contains'|'result-equals',
 * expected}]` is upconverted to `tests`.
 */
export function parseExerciseSpec(content: any): CodingExerciseSpec {
  const c = content ?? {};
  const language: SandboxLanguage = c.language === 'javascript' ? 'javascript' : 'python';
  const runner: SandboxRunner =
    c.runner === 'blockly' ? 'blockly' : language === 'javascript' ? 'sandpack' : 'pyodide';

  // Prefer the new `tests`; fall back to legacy `assertions`.
  let rawTests: any[] = Array.isArray(c.tests) ? c.tests : [];
  if (rawTests.length === 0 && Array.isArray(c.assertions)) {
    rawTests = c.assertions.map((a: any) => ({
      id: a.id,
      description: a.description,
      kind: a.type,
      expectedOutput:
        a.type === 'result-equals' ? undefined : a.expected,
      expectedReturn: a.type === 'result-equals' ? a.expected : undefined,
    }));
  }

  if (rawTests.length > MAX_TESTS) {
    throw new Error(`Coding exercise has too many tests (>${MAX_TESTS})`);
  }

  const tests: CodingTest[] = rawTests.map((t, i) => {
    if (!t || typeof t !== 'object') throw new Error(`Test #${i} is not an object`);
    const kind = t.kind;
    if (!['stdout-equals', 'stdout-contains', 'function-call', 'result-equals'].includes(kind)) {
      throw new Error(`Test #${i} has invalid kind: ${kind}`);
    }
    if ((kind === 'stdout-equals' || kind === 'stdout-contains') && typeof t.expectedOutput !== 'string') {
      throw new Error(`Test #${i} (${kind}) requires string expectedOutput`);
    }
    if (kind === 'function-call' && (typeof t.functionName !== 'string' || !Array.isArray(t.args))) {
      throw new Error(`Test #${i} (function-call) requires functionName + args[]`);
    }
    return {
      id: String(t.id ?? `test-${i}`),
      description: String(t.description ?? `Test ${i + 1}`),
      hidden: Boolean(t.hidden),
      kind,
      stdin: typeof t.stdin === 'string' ? t.stdin : undefined,
      expectedOutput: t.expectedOutput,
      functionName: t.functionName,
      args: t.args,
      expectedReturn: t.expectedReturn,
    };
  });

  const executionPolicy: ExecutionPolicy = c.executionPolicy === 'CREDENTIAL' ? 'CREDENTIAL' : 'FORMATIVE';
  const timeoutMs =
    typeof c.timeoutMs === 'number' && c.timeoutMs > 0 && c.timeoutMs <= 30_000
      ? c.timeoutMs
      : DEFAULT_TIMEOUT_MS;

  return {
    testModelVersion: typeof c.testModelVersion === 'number' ? c.testModelVersion : CODING_TEST_MODEL_VERSION,
    language,
    runner,
    prompt: c.prompt ?? '',
    starterCode: c.starterCode ?? '',
    timeoutMs,
    executionPolicy,
    tests,
  };
}

/**
 * Server-side RE-VALIDATION of client-reported test outcomes against the spec.
 *
 * The client runs each test and reports { id, passed, actual }. We do NOT trust
 * `passed` blindly: for deterministic kinds we recompute pass/fail from the
 * reported `actual` output vs the spec's expected value. This catches a client
 * that flips `passed` to true without producing the right output. (It cannot
 * catch a client that fabricates BOTH `actual` and `passed` consistently —
 * that requires server-side execution, the CREDENTIAL tier.)
 *
 * Returns the server-authoritative outcomes + score.
 */
export function gradeAgainstSpec(
  spec: CodingExerciseSpec,
  reported: CodingTestOutcome[],
): { outcomes: CodingTestOutcome[]; passed: boolean; score: number; testsPassed: number; testsTotal: number } {
  const reportedById = new Map(reported.map((r) => [r.id, r]));

  const outcomes: CodingTestOutcome[] = spec.tests.map((test) => {
    const r = reportedById.get(test.id);
    const actual = r?.actual;
    let passed = false;

    switch (test.kind) {
      case 'stdout-equals':
        passed = canonical(actual).trim() === canonical(test.expectedOutput).trim();
        break;
      case 'stdout-contains':
        passed = canonical(actual).includes(canonical(test.expectedOutput));
        break;
      case 'function-call':
      case 'result-equals':
        passed = canonical(actual) === canonical(test.expectedReturn);
        break;
      default:
        passed = false;
    }

    return {
      id: test.id,
      description: test.description,
      hidden: Boolean(test.hidden),
      passed,
      actual,
    };
  });

  const testsTotal = outcomes.length;
  const testsPassed = outcomes.filter((o) => o.passed).length;
  // No tests defined is a spec error, not a pass — score 0, not-passed.
  const score = testsTotal > 0 ? testsPassed / testsTotal : 0;
  return {
    outcomes,
    passed: testsTotal > 0 && testsPassed === testsTotal,
    score,
    testsPassed,
    testsTotal,
  };
}
