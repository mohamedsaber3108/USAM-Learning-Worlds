import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Regression tests for the public-registration privilege-escalation fix
 * (audit T-P0-1 / GAP-S1). The public register path must NEVER create an
 * ADMIN or MODERATOR account, even if a caller bypasses the DTO validation
 * and constructs the object directly. AuthService.register enforces a
 * server-side allowlist as defense-in-depth.
 *
 * Prisma/JWT/audit are stubbed — these tests assert the guard fires BEFORE
 * any DB work, so the elevated-role calls must reject without touching the
 * (unstubbed) database.
 */
describe('AuthService.register — role escalation guard (T-P0-1)', () => {
  function makeService() {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      progression: { create: jest.fn() },
    } as any;
    const jwtService = { signAsync: jest.fn().mockResolvedValue('tok') } as any;
    const configService = { get: jest.fn().mockReturnValue('secret') } as any;
    const auditLog = { record: jest.fn() } as any;
    const service = new AuthService(prisma, jwtService, configService, auditLog);
    return { service, prisma };
  }

  it.each(['ADMIN', 'MODERATOR'])(
    'rejects public registration as %s with ForbiddenException',
    async (role) => {
      const { service, prisma } = makeService();
      await expect(
        service.register({ email: 'x@y.com', password: 'password123', role } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
      // Guard must fire before any user lookup/create.
      expect(prisma.user.create).not.toHaveBeenCalled();
    },
  );

  it('allows LEARNER registration to proceed past the role guard', async () => {
    const { service, prisma } = makeService();
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'x@y.com',
      role: 'LEARNER',
      learner: { id: 'l1' },
      guardian: null,
    });
    const result = await service.register({
      email: 'x@y.com',
      password: 'password123',
      role: 'LEARNER',
      firstName: 'Kid',
      displayName: 'Kid',
    } as any);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(result.user.role).toBe('LEARNER');
  });
});
