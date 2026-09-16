/**
 * Entitlements controller (audit #11).
 *
 * Public plan listing + authenticated subscription management. Uses the
 * caller's own user id as the billing owner, so a user can only manage their
 * own subscription. NO payment gateway is wired — subscribe() goes through
 * the PaymentProvider abstraction (manual provider by default).
 */
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EntitlementsService } from './entitlements.service';

@Controller('entitlements')
export class EntitlementsController {
  constructor(private entitlements: EntitlementsService) {}

  /** Public: available plans (for a pricing page). */
  @Get('plans')
  listPlans() {
    return this.entitlements.listPlans();
  }

  /** The authenticated user's effective plan + features. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async myEntitlements(@CurrentUser() user: any) {
    const plan = await this.entitlements.getActivePlan(user.id);
    return { plan, features: plan?.features ?? {} };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@CurrentUser() user: any, @Body() body: { planCode: string }) {
    return this.entitlements.subscribe(user.id, body.planCode);
  }

  @Post('cancel/:subscriptionId')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: any, @Param('subscriptionId') subscriptionId: string) {
    return this.entitlements.cancel(user.id, subscriptionId);
  }
}
