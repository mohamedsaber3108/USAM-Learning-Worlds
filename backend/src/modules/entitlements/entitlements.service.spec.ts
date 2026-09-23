import { EntitlementsService } from './entitlements.service';
import { ManualPaymentProvider } from './payment/manual-payment.provider';

/**
 * Unit tests for entitlements (audit #11):
 *  - falls back to FREE plan features when there's no subscription
 *  - feature/limit lookups read plan.features
 *  - subscribe() activates immediately via the manual provider
 */
describe('EntitlementsService', () => {
  function make(overrides: Partial<any> = {}) {
    const prisma: any = {
      plan: { findUnique: jest.fn(), findMany: jest.fn() },
      subscription: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      learner: { findUnique: jest.fn() },
      missionRun: { count: jest.fn() },
      ...overrides,
    };
    const svc = new EntitlementsService(prisma, new ManualPaymentProvider());
    return { svc, prisma };
  }

  it('falls back to the FREE plan when there is no active subscription', async () => {
    const { svc, prisma } = make();
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.plan.findUnique.mockResolvedValue({
      code: 'FREE',
      features: { maxLearners: 1, voice: false, aiTutor: true },
    });

    expect(await svc.hasFeature('u1', 'aiTutor')).toBe(true);
    expect(await svc.hasFeature('u1', 'voice')).toBe(false);
    expect(await svc.getLimit('u1', 'maxLearners')).toBe(1);
  });

  it('reads features from the active subscription plan', async () => {
    const { svc, prisma } = make();
    prisma.subscription.findFirst.mockResolvedValue({
      plan: { code: 'FAMILY', features: { maxLearners: 4, voice: true } },
    });
    expect(await svc.hasFeature('u1', 'voice')).toBe(true);
    expect(await svc.getLimit('u1', 'maxLearners')).toBe(4);
  });

  it('subscribe() activates immediately with the manual provider', async () => {
    const { svc, prisma } = make();
    prisma.plan.findUnique.mockResolvedValue({ id: 'p1', code: 'FAMILY', isActive: true });
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.subscription.create.mockImplementation(({ data }: any) => ({ id: 's1', ...data }));

    const result = await svc.subscribe('u1', 'FAMILY');
    expect(result.activated).toBe(true);
    expect(result.checkoutUrl).toBeNull();
    expect(result.subscription.status).toBe('ACTIVE');
    expect(result.subscription.provider).toBe('manual');
  });

  describe('resolveOwnerUserIdForLearner', () => {
    it("prefers the learner's active guardian userId", async () => {
      const { svc, prisma } = make();
      prisma.learner.findUnique.mockResolvedValue({
        userId: 'learner-user',
        guardianships: [{ guardian: { userId: 'guardian-user' } }],
      });
      expect(await svc.resolveOwnerUserIdForLearner('L1')).toBe('guardian-user');
    });

    it("falls back to the learner's own userId when there is no guardian", async () => {
      const { svc, prisma } = make();
      prisma.learner.findUnique.mockResolvedValue({ userId: 'learner-user', guardianships: [] });
      expect(await svc.resolveOwnerUserIdForLearner('L1')).toBe('learner-user');
    });

    it('returns null for an unknown learner', async () => {
      const { svc, prisma } = make();
      prisma.learner.findUnique.mockResolvedValue(null);
      expect(await svc.resolveOwnerUserIdForLearner('nope')).toBeNull();
    });
  });

  describe('assertCanStartMission (missionsPerDay gate)', () => {
    it('allows unlimited when the plan sets missionsPerDay: null (paid tier)', async () => {
      const { svc, prisma } = make();
      prisma.learner.findUnique.mockResolvedValue({ userId: 'u1', guardianships: [] });
      prisma.subscription.findFirst.mockResolvedValue({
        plan: { code: 'FAMILY', features: { missionsPerDay: null } },
      });
      const result = await svc.assertCanStartMission('L1');
      expect(result.allowed).toBe(true);
      expect(result.limit).toBeNull();
      // Unlimited must not even query today's count.
      expect(prisma.missionRun.count).not.toHaveBeenCalled();
    });

    it('allows a FREE learner under the daily cap', async () => {
      const { svc, prisma } = make();
      prisma.learner.findUnique.mockResolvedValue({ userId: 'u1', guardianships: [] });
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.plan.findUnique.mockResolvedValue({ code: 'FREE', features: { missionsPerDay: 3 } });
      prisma.missionRun.count.mockResolvedValue(2);
      const result = await svc.assertCanStartMission('L1');
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(3);
      expect(result.startedToday).toBe(2);
    });

    it('blocks a FREE learner who has hit the daily cap', async () => {
      const { svc, prisma } = make();
      prisma.learner.findUnique.mockResolvedValue({ userId: 'u1', guardianships: [] });
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.plan.findUnique.mockResolvedValue({ code: 'FREE', features: { missionsPerDay: 3 } });
      prisma.missionRun.count.mockResolvedValue(3);
      await expect(svc.assertCanStartMission('L1')).rejects.toThrow(/limit of 3 missions/i);
    });
  });
});
