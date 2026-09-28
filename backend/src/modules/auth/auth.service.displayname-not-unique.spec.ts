import { AuthService } from './auth.service';

/**
 * Regression tests for the displayName-uniqueness defect.
 *
 * `Learner.displayName` used to be `@unique`, which made two children who
 * share a name (extremely common) collide with a Prisma P2002 → the public
 * `POST /auth/register` returned a 500. This is a kids platform with NO
 * username concept: identity is the immutable `learners.id`, login/account
 * identity is `User.email`. displayName is a human-friendly, NON-unique name.
 *
 * These tests assert the SERVICE contract that makes that true:
 *   1. Two learners can register with the SAME displayName (both reach
 *      user.create — the service never rejects/looks up by displayName).
 *   2. Registration does not 500 for a duplicate displayName.
 *   3. Learners are distinguished by their internal `id`, not displayName.
 *   4. The ONLY uniqueness check in register is on `email`.
 *
 * Prisma/JWT/audit are stubbed. The stub models a DB with no displayName
 * unique constraint: user.create always succeeds and returns a distinct id.
 */
describe('AuthService.register — displayName is NOT unique', () => {
  function makeService() {
    let seq = 0;
    const createdEmails = new Set<string>();
    const prisma = {
      user: {
        // Only email is unique in the real schema; model that here.
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(createdEmails.has(where.email) ? { id: 'existing' } : null),
        ),
        create: jest.fn(({ data }: any) => {
          createdEmails.add(data.email);
          seq += 1;
          const learner = data.learner
            ? { id: `learner-${seq}`, displayName: data.learner.create.displayName }
            : null;
          return Promise.resolve({
            id: `user-${seq}`,
            email: data.email,
            role: data.role,
            learner,
            guardian: null,
          });
        }),
      },
      progression: { create: jest.fn().mockResolvedValue({}) },
    } as any;
    const jwtService = { signAsync: jest.fn().mockResolvedValue('tok') } as any;
    const configService = { get: jest.fn().mockReturnValue('secret') } as any;
    const auditLog = { record: jest.fn() } as any;
    const service = new AuthService(prisma, jwtService, configService, auditLog);
    return { service, prisma };
  }

  const learnerDto = (email: string, displayName: string) => ({
    email,
    password: 'password123',
    role: 'LEARNER',
    firstName: displayName,
    displayName,
  });

  it('lets two different accounts register with the SAME displayName', async () => {
    const { service, prisma } = makeService();

    const first = await service.register(learnerDto('kid1@test.com', 'Ali') as any);
    const second = await service.register(learnerDto('kid2@test.com', 'Ali') as any);

    // Both proceeded to create — no displayName-based rejection.
    expect(prisma.user.create).toHaveBeenCalledTimes(2);
    // Same human-friendly name…
    expect(first.user.learner.displayName).toBe('Ali');
    expect(second.user.learner.displayName).toBe('Ali');
    // …but distinct internal identities.
    expect(first.user.id).not.toBe(second.user.id);
    expect(first.user.learner.id).not.toBe(second.user.learner.id);
  });

  it('does not 500 / reject the second same-name registration', async () => {
    const { service } = makeService();
    await service.register(learnerDto('a@test.com', 'Sara') as any);
    await expect(
      service.register(learnerDto('b@test.com', 'Sara') as any),
    ).resolves.toBeDefined();
  });

  it('only enforces uniqueness on email, never displayName', async () => {
    const { service, prisma } = makeService();
    await service.register(learnerDto('dup@test.com', 'Noor') as any);

    // A second account with a DIFFERENT email but SAME name is fine.
    await expect(
      service.register(learnerDto('other@test.com', 'Noor') as any),
    ).resolves.toBeDefined();

    // The pre-create existence check is keyed on email only.
    const lookups = prisma.user.findUnique.mock.calls.map((c: any[]) => c[0]);
    for (const arg of lookups) {
      expect(arg.where).toHaveProperty('email');
      expect(arg.where).not.toHaveProperty('displayName');
    }
  });

  it('addresses the learner by internal id, not displayName', async () => {
    const { service } = makeService();
    const res = await service.register(learnerDto('id@test.com', 'Zed') as any);
    expect(res.user.learner.id).toMatch(/^learner-\d+$/);
    // Identity used for downstream relations is the id, not the name.
    expect(res.user.learner.id).not.toBe(res.user.learner.displayName);
  });
});
