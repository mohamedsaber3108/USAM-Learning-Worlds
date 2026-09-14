import { BadRequestException } from '@nestjs/common';
import { CodingSandboxService, SANDBOX_LIMITS, SubmitResultDto } from './coding-sandbox.service';

/**
 * Unit tests for server-side submission limits (audit T-P1-14).
 * The service never executes code; these prove it rejects oversized
 * learner-supplied text before any DB access.
 */
describe('CodingSandboxService submission limits', () => {
  // Only enforceSubmissionLimits (private) is under test; call via submitResult
  // with a valid learnerId but oversized fields so it throws before DB use.
  const svc = new CodingSandboxService({} as any, {} as any, {} as any);

  const base: SubmitResultDto = {
    runId: 'run-1',
    activityId: 'act-1',
    code: 'print(1)',
    language: 'python',
    stdout: '1',
  };

  it('rejects code over the size limit', async () => {
    const dto = { ...base, code: 'x'.repeat(SANDBOX_LIMITS.MAX_CODE_CHARS + 1) };
    await expect(svc.submitResult('learner-1', dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects stdout over the size limit', async () => {
    const dto = { ...base, stdout: 'y'.repeat(SANDBOX_LIMITS.MAX_STDOUT_CHARS + 1) };
    await expect(svc.submitResult('learner-1', dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects stderr over the size limit', async () => {
    const dto = { ...base, stderr: 'z'.repeat(SANDBOX_LIMITS.MAX_STDERR_CHARS + 1) };
    await expect(svc.submitResult('learner-1', dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an oversized serialized result', async () => {
    const dto = { ...base, result: 'w'.repeat(SANDBOX_LIMITS.MAX_RESULT_CHARS + 1) };
    await expect(svc.submitResult('learner-1', dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects submissions with no learner id', async () => {
    await expect(svc.submitResult('', base)).rejects.toBeInstanceOf(BadRequestException);
  });
});
