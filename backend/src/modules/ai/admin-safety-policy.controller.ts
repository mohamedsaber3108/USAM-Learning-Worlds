/**
 * AI Prompt/Policy Engine (Safety slice) — admin read-only endpoint.
 *
 * View over SafetyPolicy, the versioned/auditable safety-rule table
 * that moderation.service.ts / character-safety.service.ts reference
 * by version. Read-only: this controller does not create/edit policy
 * versions (that's SafetyPolicyService.createPolicyVersion(), invoked
 * by seed scripts / future admin tooling), same "history viewer, not
 * an authoring UI" scope as admin-ai-eval.controller.ts. Guarded by
 * the real ADMIN role via JwtAuthGuard + RolesGuard, same pattern as
 * AdminAIEvalController.
 */
import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, AgeBand } from '@prisma/client';
import { SafetyPolicyService } from './services/safety-policy.service';

@Controller('admin/safety-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSafetyPolicyController {
  constructor(private safetyPolicy: SafetyPolicyService) {}

  /**
   * List every policy version across all age bands (or filtered to
   * one ageBand via ?ageBand=), most recent version per band first.
   */
  @Get()
  async listPolicies(@Query('ageBand') ageBand?: AgeBand) {
    return this.safetyPolicy.listPolicies(ageBand);
  }

  /**
   * The currently-active policy for one ageBand - what
   * moderation.service.ts / character-safety.service.ts would resolve
   * to right now for that band.
   */
  @Get(':ageBand/active')
  async getActive(@Param('ageBand') ageBand: AgeBand) {
    return this.safetyPolicy.getActivePolicy(ageBand);
  }

  /**
   * Drill into one specific historical version for an ageBand -
   * audit trail for "what did this policy say before it changed."
   */
  @Get(':ageBand/versions/:version')
  async getVersion(
    @Param('ageBand') ageBand: AgeBand,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.safetyPolicy.getPolicyVersion(ageBand, version);
  }
}
