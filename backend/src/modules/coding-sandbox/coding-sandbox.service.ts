/**
 * Coding Sandbox Service
 *
 * Trust boundary: this service NEVER executes learner-submitted code.
 * Code execution happens entirely client-side in the browser, via Pyodide
 * (Python, WASM, in a Web Worker) or Sandpack (JS/React, in-browser bundler).
 * See docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 1.
 *
 * This service's job is exactly the three things the plan calls for:
 *  (a) serve mission starter code + test assertions
 *  (b) receive already-executed RESULTS (stdout/stderr/return value) from
 *      the browser and validate them against an expected-output spec
 *  (c) persist the outcome to ActivityAttempt (reusing the existing
 *      Missions/Mastery data model rather than inventing new tables)
 *  (d) hand the code TEXT (never execute it) to CodingCoachService for
 *      AI review commentary
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MasteryService } from '../mastery/mastery.service';
import { CodingCoachService } from '../ai/services/coding-coach.service';
import {
  parseExerciseSpec,
  gradeAgainstSpec,
  canonical,
  CODING_TEST_MODEL_VERSION,
  type CodingExerciseSpec,
  type CodingTest,
  type CodingTestOutcome,
} from './coding-test-model';

export type SandboxLanguage = 'python' | 'javascript';

/**
 * Server-side submission limits (audit T-P1-14 / code-sandbox hardening).
 *
 * Even though code is executed CLIENT-SIDE (Pyodide/Sandpack in a Web
 * Worker, never on our servers — see the class doc), the backend still
 * accepts learner-supplied text (code + captured stdout/stderr/result) and
 * persists it. Unbounded text is a real abuse/DoS vector: a script could
 * POST multi-megabyte payloads to bloat the DB or exhaust request handling.
 * These caps bound every field we store. They are intentionally generous
 * for real learner programs but firmly finite.
 */
export const SANDBOX_LIMITS = {
  /** Max learner source code length (chars). ~200KB of code is far beyond
   * any legitimate child coding mission. */
  MAX_CODE_CHARS: 200_000,
  /** Max captured stdout we persist. Client already truncates; this is the
   * server-side backstop. */
  MAX_STDOUT_CHARS: 100_000,
  /** Max captured stderr we persist. */
  MAX_STDERR_CHARS: 50_000,
  /** Max serialized result value we persist. */
  MAX_RESULT_CHARS: 50_000,
} as const;

/**
 * Mission spec served to the browser runner. Carries the full test model
 * (visible tests shown to the learner; hidden tests are sent so the browser
 * can run them, but the UI hides their expected values). No code is executed
 * server-side — this is the exercise definition only.
 */
export interface CodingMissionSpec {
  activityId: string;
  title: string;
  language: SandboxLanguage;
  runner: 'pyodide' | 'sandpack' | 'blockly';
  prompt: string;
  starterCode: string;
  timeoutMs: number;
  executionPolicy: 'FORMATIVE' | 'CREDENTIAL';
  testModelVersion: number;
  tests: CodingTest[];
}

export interface SubmitResultDto {
  runId: string;
  activityId: string;
  code: string;
  language: SandboxLanguage;
  /** Already-executed output captured client-side. */
  stdout: string;
  stderr?: string;
  result?: unknown;
  durationMs?: number;
  timedOut?: boolean;
  /**
   * Per-test outcomes the CLIENT computed. The server RE-VALIDATES each
   * against the exercise spec (see gradeAgainstSpec) — client `passed` is
   * never trusted, only the reported `actual` output is re-checked.
   */
  testOutcomes?: CodingTestOutcome[];
  /** Learner effort metadata for richer Evidence (not trusted for grading). */
  hintsUsed?: number;
  attemptNumber?: number;
}

@Injectable()
export class CodingSandboxService {
  constructor(
    private prisma: PrismaService,
    private masteryService: MasteryService,
    private codingCoach: CodingCoachService,
  ) {}

  /**
   * Serve mission starter code + assertions for a CODE-type Activity.
   * The mission's `content` JSON on the Activity model already stores
   * exactly this shape (no new Prisma model needed).
   */
  async getMission(activityId: string): Promise<CodingMissionSpec> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('Coding mission not found');
    }

    if (activity.type !== 'CODE') {
      throw new BadRequestException('Activity is not a coding mission');
    }

    // parseExerciseSpec validates the content, upconverts legacy `assertions`,
    // and normalizes language/runner/timeout/policy. A malformed spec throws
    // here (mapped to 400) rather than silently degrading to "no tests => pass".
    let spec: CodingExerciseSpec;
    try {
      spec = parseExerciseSpec({
        ...(activity.content as any),
        prompt: (activity.content as any)?.prompt ?? activity.description ?? '',
      });
    } catch (e: any) {
      throw new BadRequestException(`Coding activity has an invalid exercise spec: ${e?.message ?? e}`);
    }

    // TRUST: strip HIDDEN tests' expected values before sending to the browser
    // so "hidden" is honest — the client can still RUN a hidden test (it has
    // id/kind/functionName/args) and report the produced `actual`, but it never
    // learns the expected output, and the server holds the authoritative
    // expected value to re-validate against. Visible tests keep their expected
    // value (they are shown to the learner as worked examples).
    const clientTests = spec.tests.map((t) =>
      t.hidden
        ? { id: t.id, description: t.description, hidden: true, kind: t.kind, functionName: t.functionName, args: t.args, stdin: t.stdin }
        : t,
    );

    return {
      activityId: activity.id,
      title: activity.title,
      language: spec.language,
      runner: spec.runner,
      prompt: spec.prompt,
      starterCode: spec.starterCode,
      timeoutMs: spec.timeoutMs,
      executionPolicy: spec.executionPolicy,
      testModelVersion: spec.testModelVersion,
      tests: clientTests,
    };
  }

  /**
   * Reject a submission whose stored text fields exceed SANDBOX_LIMITS.
   * Runs before any DB access so oversized payloads never touch storage.
   */
  private enforceSubmissionLimits(submission: SubmitResultDto): void {
    const code = submission.code ?? '';
    if (typeof code !== 'string' || code.length > SANDBOX_LIMITS.MAX_CODE_CHARS) {
      throw new BadRequestException(
        `Submitted code exceeds the ${SANDBOX_LIMITS.MAX_CODE_CHARS}-character limit`,
      );
    }

    const stdout = submission.stdout ?? '';
    if (typeof stdout !== 'string' || stdout.length > SANDBOX_LIMITS.MAX_STDOUT_CHARS) {
      throw new BadRequestException(
        `Captured stdout exceeds the ${SANDBOX_LIMITS.MAX_STDOUT_CHARS}-character limit`,
      );
    }

    if (
      submission.stderr !== undefined &&
      (typeof submission.stderr !== 'string' ||
        submission.stderr.length > SANDBOX_LIMITS.MAX_STDERR_CHARS)
    ) {
      throw new BadRequestException(
        `Captured stderr exceeds the ${SANDBOX_LIMITS.MAX_STDERR_CHARS}-character limit`,
      );
    }

    if (canonical(submission.result).length > SANDBOX_LIMITS.MAX_RESULT_CHARS) {
      throw new BadRequestException(
        `Captured result exceeds the ${SANDBOX_LIMITS.MAX_RESULT_CHARS}-character limit`,
      );
    }
  }

  /**
   * Receive client-executed results, validate, persist to ActivityAttempt,
   * and attach AI code-review commentary (static text review only — the
   * AI is never given execution capability either).
   */
  async submitResult(learnerId: string, submission: SubmitResultDto) {
    if (!learnerId) {
      throw new BadRequestException('Only learners can submit coding attempts');
    }

    // Enforce server-side submission limits BEFORE any DB work (audit
    // T-P1-14). Reject oversized payloads outright rather than silently
    // truncating — a legitimate learner program never approaches these
    // sizes, so an over-limit submission is either a bug or abuse.
    this.enforceSubmissionLimits(submission);

    const run = await this.prisma.missionRun.findUnique({ where: { id: submission.runId } });
    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    const activity = await this.prisma.activity.findUnique({
      where: { id: submission.activityId },
      include: { objective: { include: { competency: true } } },
    });
    if (!activity) {
      throw new NotFoundException('Coding activity not found');
    }

    // INTEGRITY: the activity must actually belong to THIS run's mission.
    // Without this, a result could be replayed against an unrelated mission
    // run (adversarial case #9) or an activity from a different mission
    // submitted under this run. The MissionActivity join is the source of
    // truth for "this activity is part of this mission".
    const belongsToMission = await this.prisma.missionActivity.findFirst({
      where: { missionId: run.missionId, activityId: submission.activityId },
      select: { id: true },
    });
    if (!belongsToMission) {
      throw new BadRequestException('Activity does not belong to this mission run');
    }

    // Parse the authoritative spec from the Activity (never trust the client's
    // idea of the tests) and grade the client-reported outcomes against it.
    let spec: CodingExerciseSpec;
    try {
      spec = parseExerciseSpec({
        ...(activity.content as any),
        prompt: (activity.content as any)?.prompt ?? activity.description ?? '',
      });
    } catch (e: any) {
      throw new BadRequestException(`Coding activity has an invalid exercise spec: ${e?.message ?? e}`);
    }

    // A timed-out run fails outright (infinite loop / too slow) regardless of
    // any outcomes the client reports.
    const reported = submission.timedOut ? [] : submission.testOutcomes ?? [];
    const graded = gradeAgainstSpec(spec, reported);
    const { outcomes, passed, score, testsPassed, testsTotal } = graded;

    // AI code review — static text analysis only, never executes the code.
    // Feed the real failing-test + task context so Codey guides toward the
    // specific gap (not a vacuum review, not the full solution).
    let coachFeedback: string | null = null;
    try {
      const review = await this.codingCoach.reviewCode({
        learnerId,
        code: submission.code,
        language: submission.language,
        objectiveId: activity.objectiveId,
        taskPrompt: spec.prompt,
        failingTests: outcomes
          .filter((o) => !o.passed)
          .map((o) => ({ description: o.description, actual: o.actual })),
        hintsUsed: submission.hintsUsed,
        attemptNumber: submission.attemptNumber,
      });
      coachFeedback = review.feedback;
    } catch {
      // AI feedback is best-effort; a failure here must not block grading.
      // (Bedrock runtime may be externally unavailable — grading still lands.)
      coachFeedback = null;
    }

    const attempt = await this.prisma.activityAttempt.create({
      data: {
        runId: submission.runId,
        activityId: submission.activityId,
        response: {
          code: submission.code,
          language: submission.language,
          stdout: submission.stdout,
          stderr: submission.stderr ?? null,
          result: submission.result ?? null,
          durationMs: submission.durationMs ?? null,
          timedOut: submission.timedOut ?? false,
          testOutcomes: outcomes, // server-authoritative
          executedBy: spec.runner, // client-side runner, never the backend
        } as any,
        success: passed,
        score,
        feedback: coachFeedback,
      },
    });

    if (activity.objective?.competencyId) {
      // Rich Evidence.context justifies the mastery signal without storing
      // unbounded telemetry. The mastery engine stays generic — Coding just
      // produces richer context. executionPolicy records the trust tier so
      // credential logic can distinguish FORMATIVE (browser) evidence later.
      await this.masteryService.recordEvidence(
        learnerId,
        activity.objective.competencyId,
        'CREATION',
        passed,
        score,
        {
          activityId: activity.id,
          attemptId: attempt.id,
          runner: spec.runner,
          language: spec.language,
          executionPolicy: spec.executionPolicy,
          testModelVersion: spec.testModelVersion,
          testsPassed,
          testsTotal,
          hintsUsed: typeof submission.hintsUsed === 'number' ? submission.hintsUsed : 0,
          attemptNumber: typeof submission.attemptNumber === 'number' ? submission.attemptNumber : 1,
          hadRuntimeError: Boolean(submission.stderr),
          timedOut: Boolean(submission.timedOut),
          durationMs: submission.durationMs ?? null,
        },
        attempt.id,
      );
    }

    return {
      attempt,
      outcomes,
      passed,
      score,
      testsPassed,
      testsTotal,
      coachFeedback,
    };
  }
}
