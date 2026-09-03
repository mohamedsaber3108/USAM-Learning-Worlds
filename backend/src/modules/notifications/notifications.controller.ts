import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query('unreadOnly') unreadOnly?: string) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have notifications');
    return this.notificationsService.list(learnerId, unreadOnly === 'true');
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have notifications');
    const count = await this.notificationsService.unreadCount(learnerId);
    return { count };
  }

  @Post(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have notifications');
    return this.notificationsService.markRead(learnerId, id);
  }

  @Post('read-all')
  async markAllRead(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have notifications');
    return this.notificationsService.markAllRead(learnerId);
  }

  /**
   * Manual trigger endpoint for the streak-at-risk check (in production
   * this would also be wired to a scheduled cron job — exposed here as a
   * real, callable endpoint for ops/testing since this repo doesn't yet
   * have a generic cron runner wired for notification jobs).
   */
  @Post('check-streaks')
  async checkStreaks() {
    return this.notificationsService.checkStreaksAtRisk();
  }
}
