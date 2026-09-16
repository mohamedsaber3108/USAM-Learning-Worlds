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
});
