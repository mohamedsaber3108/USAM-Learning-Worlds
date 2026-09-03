import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Read-side for the Audit Engine. Staff-only (ADMIN/MODERATOR) — audit
 * logs themselves are sensitive (they contain guardian/learner IDs and
 * before/after state), so access mirrors the staff check already used
 * in learner-model.controller.ts.
 */
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditLog: AuditLogService) {}

  @Get('logs')
  async getLogs(
    @CurrentUser() user: any,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('take') take?: string,
  ) {
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new ForbiddenException('Only staff can view the audit log');
    }

    return this.auditLog.list({
      action,
      targetType,
      take: take ? parseInt(take, 10) : undefined,
    });
  }
}
