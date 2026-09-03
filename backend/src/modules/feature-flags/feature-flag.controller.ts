import { Controller, Get, Patch, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Minimal admin surface for the Feature Flag Engine — list flags and
 * toggle the one real flag this pass wires up (`streak_freeze_shop`).
 * Staff-only, same ADMIN/MODERATOR check used elsewhere in the app.
 */
@Controller('feature-flags')
@UseGuards(JwtAuthGuard)
export class FeatureFlagController {
  constructor(private featureFlags: FeatureFlagService) {}

  @Get()
  async listFlags(@CurrentUser() user: any) {
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new ForbiddenException('Only staff can view feature flags');
    }

    return this.featureFlags.list();
  }

  @Patch(':key')
  async toggleFlag(
    @CurrentUser() user: any,
    @Param('key') key: string,
    @Body() dto: { isEnabledGlobally: boolean },
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can toggle feature flags');
    }

    return this.featureFlags.setGlobalState(key, dto.isEnabledGlobally);
  }
}
