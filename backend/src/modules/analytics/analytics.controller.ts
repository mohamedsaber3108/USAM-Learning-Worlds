import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Admin Analytics Engine v1 — staff-only aggregate views over
 * LearningEvent. Same JwtAuthGuard + RolesGuard('ADMIN') pattern used by
 * other staff-facing controllers in this codebase (e.g. audit).
 *
 * `days` is clamped server-side to keep the naive in-memory aggregation
 * in AnalyticsService bounded — see that file's getDailyActivity() note.
 */
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  private clampDays(days: number): number {
    if (Number.isNaN(days) || days < 1) return 30;
    return Math.min(days, 90);
  }

  @Get('overview')
  async getOverview(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.analytics.getOverview(this.clampDays(days));
  }

  @Get('events-by-type')
  async getEventsByType(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.analytics.getEventsByType(this.clampDays(days));
  }

  @Get('daily-activity')
  async getDailyActivity(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.analytics.getDailyActivity(this.clampDays(days));
  }
}
