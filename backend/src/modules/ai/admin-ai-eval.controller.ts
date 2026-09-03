/**
 * AI Evaluation Harness — admin history endpoint.
 *
 * Read-only view over AIEvalRun/AIEvalResult (populated by
 * backend/scripts/run-ai-eval.ts, run manually/via cron — this controller
 * does not trigger a run itself). Guarded by the real ADMIN role via
 * the existing RolesGuard + @Roles() decorator, same pattern as
 * admin-missions.controller.ts.
 */
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AIEvalService } from './ai-eval.service';

@Controller('admin/ai-eval')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminAIEvalController {
  constructor(private aiEvalService: AIEvalService) {}

  /**
   * List historical eval runs (most recent first), each with its
   * aggregate score/pass-count so score trends over time are visible
   * without pulling every per-case result.
   */
  @Get('runs')
  async listRuns(@Query('limit') limit?: string) {
    return this.aiEvalService.listRuns(limit ? parseInt(limit, 10) : 20);
  }

  /**
   * Drill into one run's per-case results (rubric breakdown, response
   * text, errors) — for diagnosing a score regression.
   */
  @Get('runs/:id')
  async getRun(@Param('id') id: string) {
    return this.aiEvalService.getRun(id);
  }
}
