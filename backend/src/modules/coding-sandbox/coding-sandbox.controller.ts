/**
 * Coding Sandbox Controller
 *
 * Exposes the coding-sandbox module over HTTP. This controller never
 * accepts "execute this code for me" — it only serves mission specs and
 * accepts already-executed client results. See coding-sandbox.service.ts
 * for the full trust-boundary rationale.
 */

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CodingSandboxService, SubmitResultDto } from './coding-sandbox.service';

@Controller('coding-sandbox')
@UseGuards(JwtAuthGuard)
export class CodingSandboxController {
  constructor(private codingSandbox: CodingSandboxService) {}

  /**
   * Get a coding mission's starter code + assertions (never returns an
   * execution result — the mission spec only).
   */
  @Get('missions/:activityId')
  async getMission(@Param('activityId') activityId: string) {
    return this.codingSandbox.getMission(activityId);
  }

  /**
   * Submit the RESULT of a client-side Pyodide/Sandpack run (stdout,
   * stderr, return value) for validation, persistence, and AI review.
   * This endpoint never runs the submitted code.
   */
  @Post('submissions')
  async submitResult(
    @CurrentUser() user: any,
    @Body() dto: Omit<SubmitResultDto, never>,
  ) {
    const learnerId = user?.learner?.id;
    return this.codingSandbox.submitResult(learnerId, dto as SubmitResultDto);
  }
}
