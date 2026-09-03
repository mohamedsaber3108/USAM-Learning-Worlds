import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ContentQaService } from './content-qa.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Content QA Engine v1 — admin-only endpoints.
 *
 * POST /api/admin/content-qa/scan  — runs the scan fresh over live
 *   Activity/Mission rows and persists every newly-found issue as a
 *   ContentQAFlag (idempotent: re-running does not duplicate flags that
 *   are already open for the same entity+flagType).
 * GET  /api/admin/content-qa/flags — lists currently open (unresolved)
 *   flags, optionally filtered by entityType/flagType.
 *
 * Guarded the same way admin-missions.controller.ts guards its
 * authoring endpoints: JwtAuthGuard + RolesGuard + @Roles(Role.ADMIN).
 */
@Controller('admin/content-qa')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContentQaController {
  constructor(private contentQa: ContentQaService) {}

  @Post('scan')
  async scan() {
    return this.contentQa.scanAndPersist();
  }

  @Get('flags')
  async listFlags(
    @Query('entityType') entityType?: string,
    @Query('flagType') flagType?: string,
    @Query('take') take?: string,
  ) {
    return this.contentQa.listOpenFlags({
      entityType,
      flagType,
      take: take ? parseInt(take, 10) : undefined,
    });
  }
}
