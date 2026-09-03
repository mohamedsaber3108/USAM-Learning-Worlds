/**
 * AI Memory Governance v1 (agent-ai-memory-governance)
 *
 * Admin-only visibility endpoint over the retention metadata added to
 * ConversationMessage/CharacterInteraction. Follows the same
 * staff-only ADMIN/MODERATOR guard pattern used in
 * FeatureFlagController (JwtAuthGuard + role check on the current
 * user), since this data (message/interaction volumes, purge backlog)
 * is operational/compliance information, not learner-facing.
 */

import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { MemoryGovernanceService } from './memory-governance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/memory-governance')
@UseGuards(JwtAuthGuard)
export class MemoryGovernanceController {
  constructor(private memoryGovernance: MemoryGovernanceService) {}

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new ForbiddenException('Only staff can view AI memory governance stats');
    }

    return this.memoryGovernance.getStats();
  }
}
