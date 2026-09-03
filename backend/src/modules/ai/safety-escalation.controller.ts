/**
 * Admin/moderator REST surface for the SafetyEscalation queue.
 *
 * Closes a real gap: CharacterSafetyService's 'escalation_required'
 * SafetyState previously had no persisted, actionable record and
 * therefore no way for a human to work it as a queue. Guarded by the
 * real MODERATOR/ADMIN roles via RolesGuard + @Roles(), same pattern as
 * admin-ai-eval.controller.ts / analytics.controller.ts.
 */
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { SafetyEscalationService } from './services/safety-escalation.service';
import {
  AssignSafetyEscalationDto,
  ListSafetyEscalationsQueryDto,
  ResolveSafetyEscalationDto,
} from './dto/safety-escalation.dto';

@Controller('safety-escalations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MODERATOR, Role.ADMIN)
export class SafetyEscalationController {
  constructor(private safetyEscalationService: SafetyEscalationService) {}

  /**
   * List escalations, most recent first. Pass ?status=OPEN|IN_PROGRESS|
   * RESOLVED to filter; with no filter, returns every escalation
   * regardless of status (callers building a "queue" view should pass
   * status explicitly to avoid drowning in resolved history).
   */
  @Get()
  async list(@Query() query: ListSafetyEscalationsQueryDto) {
    return this.safetyEscalationService.list(query.status as any);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.safetyEscalationService.findOne(id);
  }

  /**
   * Claim an escalation for review. Defaults assignedTo to the calling
   * moderator/admin's user id if the body omits it.
   */
  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignSafetyEscalationDto,
    @CurrentUser() user: any,
  ) {
    return this.safetyEscalationService.assign(id, dto.assignedTo ?? user?.id);
  }

  /**
   * Mark an escalation resolved. Requires resolutionType + resolutionNote
   * (Teacher/Mentor Engine v1: every resolution must record a real human
   * decision, not just a status flip). resolvedBy defaults to the
   * calling moderator/admin's user id if the body omits it.
   * resolutionType=REFERRED_TO_GUARDIAN fans out a real PARENT_FLAG
   * notification to the learner's guardians.
   */
  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveSafetyEscalationDto,
    @CurrentUser() user: any,
  ) {
    return this.safetyEscalationService.resolve(
      id,
      dto.resolutionType as any,
      dto.resolutionNote,
      dto.resolvedBy ?? user?.id,
    );
  }

  /**
   * Teacher/Mentor Engine v1 ops summary: open/in-progress backlog size
   * and a resolution-type breakdown of everything resolved, so whoever
   * staffs this queue has an at-a-glance signal instead of only a raw
   * list.
   */
  @Get('stats/summary')
  async stats() {
    return this.safetyEscalationService.stats();
  }
}
