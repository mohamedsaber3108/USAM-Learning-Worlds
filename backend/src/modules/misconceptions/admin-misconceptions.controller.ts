import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MisconceptionService } from './misconception.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Misconception Engine v1 — admin-only read surface.
 *
 * Shows top wrong-answer patterns (by frequency) for a given
 * QuestionTemplate or mission Activity, so a curriculum admin can see
 * what learners actually get wrong, not just pass/fail rates. Guarded by
 * the same real ADMIN role + RolesGuard pattern used by
 * AdminMissionsController.
 */
@Controller('admin/misconceptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminMisconceptionsController {
  constructor(private misconceptionService: MisconceptionService) {}

  // NOTE: '/by-activity/:activityId' must be declared before the
  // catch-all '/:questionId' route below, otherwise Nest's
  // declaration-order route matching would treat "by-activity" as a
  // questionId value and never reach this handler.
  @Get('by-activity/:activityId')
  async byActivity(@Param('activityId') activityId: string) {
    return this.misconceptionService.getByActivity(activityId);
  }

  @Get(':questionId')
  async byQuestion(@Param('questionId') questionId: string) {
    return this.misconceptionService.getByQuestionTemplate(questionId);
  }
}
