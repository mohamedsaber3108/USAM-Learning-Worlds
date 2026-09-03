import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Get()
  async getMissions() {
    return this.missionsService.getMissions();
  }

  @Get('activities/by-purpose/:purpose')
  async getActivitiesByPurpose(@Param('purpose') purpose: string) {
    return this.missionsService.getActivitiesByAssessmentPurpose(purpose);
  }

  @Get(':id')
  async getMission(@Param('id') id: string) {
    return this.missionsService.getMission(id);
  }

  @Post(':id/start')
  async startMission(@CurrentUser() user: any, @Param('id') missionId: string) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can start missions');
    }

    return this.missionsService.startMission(learnerId, missionId);
  }

  @Get('runs/:runId')
  async getMissionRun(@Param('runId') runId: string) {
    return this.missionsService.getMissionRun(runId);
  }

  @Post('runs/:runId/submit')
  async submitActivity(
    @CurrentUser() user: any,
    @Param('runId') runId: string,
    @Body() dto: { activityId: string; response: any; hintCount?: number; timeOnTaskSeconds?: number; pauseCount?: number },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can submit activities');
    }

    return this.missionsService.submitActivity(
      learnerId,
      runId,
      dto.activityId,
      dto.response,
      { hintCount: dto.hintCount, timeOnTaskSeconds: dto.timeOnTaskSeconds, pauseCount: dto.pauseCount },
    );
  }

  @Post('runs/:runId/complete')
  async completeMission(@CurrentUser() user: any, @Param('runId') runId: string) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can complete missions');
    }

    return this.missionsService.completeMission(learnerId, runId);
  }

  @Get('history/me')
  async getMyHistory(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have mission history');
    }

    return this.missionsService.getMissionHistory(learnerId);
  }
}
