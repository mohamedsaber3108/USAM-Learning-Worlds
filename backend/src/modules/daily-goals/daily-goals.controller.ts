import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { DailyGoalsService } from './daily-goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('daily-goals')
@UseGuards(JwtAuthGuard)
export class DailyGoalsController {
  constructor(private dailyGoalsService: DailyGoalsService) {}

  @Get('me')
  async getGoal(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have daily goals');
    return this.dailyGoalsService.getGoal(learnerId);
  }

  @Put('me')
  async setGoal(
    @CurrentUser() user: any,
    @Body() dto: { targetMinutes: number; targetActivities: number },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have daily goals');
    return this.dailyGoalsService.setGoal(learnerId, dto.targetMinutes, dto.targetActivities);
  }

  @Get('me/progress')
  async getProgress(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have daily goal progress');
    return this.dailyGoalsService.getTodayProgress(learnerId);
  }
}
