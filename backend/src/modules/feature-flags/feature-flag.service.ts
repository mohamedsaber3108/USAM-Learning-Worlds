import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Feature Flag Engine — real, small FeatureFlag model + isEnabled().
 *
 * Rollout model kept deliberately simple (see schema.prisma comment on
 * FeatureFlag): a flag is either on/off globally, or on for a specific
 * allow-list of learnerIds. No % rollout/bucketing — that's a distinct,
 * larger experimentation engine this pass doesn't attempt.
 *
 * ONE real usage: gamification/streak-freeze.service.ts calls
 * isEnabled('streak_freeze_shop', learnerId) before allowing a
 * purchase. Missing flag keys default to disabled (fail-closed) rather
 * than silently no-op'ing as "always on", so the mechanism actually
 * does something observable.
 */
@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  constructor(private prisma: PrismaService) {}

  async isEnabled(flagKey: string, learnerId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key: flagKey } });

    if (!flag) {
      this.logger.warn(`Feature flag "${flagKey}" not found — defaulting to disabled`);
      return false;
    }

    if (learnerId && flag.learnerOverrides.includes(learnerId)) {
      return true;
    }

    return flag.isEnabledGlobally;
  }

  async list() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async setGlobalState(flagKey: string, isEnabledGlobally: boolean) {
    return this.prisma.featureFlag.update({
      where: { key: flagKey },
      data: { isEnabledGlobally },
    });
  }
}
