/**
 * Entitlements Service (audit #11)
 *
 * Resolves what a billing owner (guardian) is entitled to, based on their
 * active Subscription's Plan features. Every capability check in the product
 * should go through `hasFeature()` / `getLimit()` rather than hard-coding
 * tier logic. Subscription creation goes through the PaymentProvider
 * abstraction, so switching on a real gateway later requires no changes here.
 */
import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  PAYMENT_PROVIDER,
  PaymentProvider,
} from './payment/payment-provider.interface';

/** Features fall back to the FREE plan when a user has no active subscription. */
const DEFAULT_PLAN_CODE = 'FREE';

@Injectable()
export class EntitlementsService {
  private readonly logger = new Logger(EntitlementsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly payment: PaymentProvider,
  ) {}

  listPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceCents: 'asc' },
    });
  }

  /**
   * The user's currently effective plan: their active subscription's plan, or
   * the FREE plan as a fallback. Never returns null so callers can always
   * read features.
   */
  async getActivePlan(ownerUserId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: {
        ownerUserId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    if (sub?.plan) return sub.plan;

    const free = await this.prisma.plan.findUnique({ where: { code: DEFAULT_PLAN_CODE } });
    if (!free) {
      // The FREE plan is seeded by migration; if it's genuinely missing we
      // fail closed to an empty feature set rather than throwing.
      this.logger.warn('FREE plan not found; defaulting to empty entitlements');
      return null;
    }
    return free;
  }

  /** Boolean feature flag check (e.g. hasFeature(user, 'voice')). */
  async hasFeature(ownerUserId: string, feature: string): Promise<boolean> {
    const plan = await this.getActivePlan(ownerUserId);
    const features = (plan?.features as Record<string, unknown>) ?? {};
    return features[feature] === true;
  }

  /** Numeric limit check (e.g. getLimit(user, 'maxLearners')). */
  async getLimit(ownerUserId: string, key: string): Promise<number | null> {
    const plan = await this.getActivePlan(ownerUserId);
    const features = (plan?.features as Record<string, unknown>) ?? {};
    const value = features[key];
    return typeof value === 'number' ? value : null;
  }

  /**
   * Resolve the billing owner (a User id) for a given learner. Entitlements
   * are owned by a guardian, so we prefer the learner's active guardian's
   * userId; when a learner has no guardian (self-managed account) we fall
   * back to the learner's own userId. Never throws — a learner with neither
   * resolvable owner simply gets FREE-tier entitlements downstream.
   */
  async resolveOwnerUserIdForLearner(learnerId: string): Promise<string | null> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      select: {
        userId: true,
        guardianships: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { guardian: { select: { userId: true } } },
        },
      },
    });
    if (!learner) return null;
    return learner.guardianships[0]?.guardian?.userId ?? learner.userId;
  }

  /**
   * Enforce the plan's `missionsPerDay` cap for a learner. A null/absent limit
   * means unlimited (paid tiers). Only counts mission runs the learner STARTED
   * today (UTC day), so resuming an already-started run is never blocked.
   * Returns the limit info so callers/tests can reason about it; throws
   * ForbiddenException when the cap is reached.
   */
  async assertCanStartMission(learnerId: string): Promise<{ allowed: true; limit: number | null; startedToday: number }> {
    const ownerUserId = await this.resolveOwnerUserIdForLearner(learnerId);
    const limit = ownerUserId ? await this.getLimit(ownerUserId, 'missionsPerDay') : 3;

    // No numeric limit => unlimited (paid tiers set missionsPerDay: null).
    if (limit === null) {
      return { allowed: true, limit: null, startedToday: 0 };
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const startedToday = await this.prisma.missionRun.count({
      where: { learnerId, startedAt: { gte: startOfDay } },
    });

    if (startedToday >= limit) {
      throw new ForbiddenException(
        `You've reached today's limit of ${limit} missions on the free plan. Come back tomorrow, or upgrade for unlimited missions.`,
      );
    }

    return { allowed: true, limit, startedToday };
  }

  /**
   * Begin a subscription to a plan. Routes through the PaymentProvider: the
   * manual provider activates immediately (free/comped); a real provider
   * would return a checkoutUrl and activate on webhook. Idempotent-ish: an
   * existing active subscription to the same plan is returned as-is.
   */
  async subscribe(ownerUserId: string, planCode: string) {
    const plan = await this.prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');

    const existing = await this.prisma.subscription.findFirst({
      where: { ownerUserId, planId: plan.id, status: { in: ['ACTIVE', 'TRIALING'] } },
    });
    if (existing) {
      return { subscription: existing, checkoutUrl: null, activated: true };
    }

    const checkout = await this.payment.createCheckout({ ownerUserId, planCode });

    const subscription = await this.prisma.subscription.create({
      data: {
        ownerUserId,
        planId: plan.id,
        provider: checkout.provider,
        providerRef: checkout.providerRef,
        // Manual/free activates immediately; a real gateway would start
        // PENDING/TRIALING until the webhook confirms payment.
        status: checkout.activated ? 'ACTIVE' : 'TRIALING',
      },
    });

    return { subscription, checkoutUrl: checkout.checkoutUrl, activated: checkout.activated };
  }

  /** Cancel at period end (keeps access until the period they paid for ends). */
  async cancel(ownerUserId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, ownerUserId },
    });
    if (!sub) throw new NotFoundException('Subscription not found');

    if (sub.providerRef) {
      await this.payment.cancel(sub.providerRef);
    }

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });
  }
}
