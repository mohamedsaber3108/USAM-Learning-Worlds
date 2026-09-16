/**
 * Content Provenance admin controller (audit T-P1-7).
 *
 * ADMIN-only surface to register licenses/sources, attach provenance to
 * content, and run compliance checks before publishing externally-sourced
 * content. Guarded by the real ADMIN role via JwtAuthGuard + RolesGuard,
 * same pattern as AdminSafetyPolicyController.
 */
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ContentProvenanceService,
  CreateSourceDto,
  UpsertLicenseDto,
} from './content-provenance.service';

@Controller('admin/content-provenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContentProvenanceController {
  constructor(private provenance: ContentProvenanceService) {}

  @Get('licenses')
  listLicenses() {
    return this.provenance.listLicenses();
  }

  @Post('licenses')
  upsertLicense(@Body() dto: UpsertLicenseDto) {
    return this.provenance.upsertLicense(dto);
  }

  @Get('sources')
  listSources() {
    return this.provenance.listSources();
  }

  @Post('sources')
  createSource(@Body() dto: CreateSourceDto) {
    return this.provenance.createSource(dto);
  }

  @Post('content/:contentItemId/source/:sourceId')
  attach(
    @Param('contentItemId') contentItemId: string,
    @Param('sourceId') sourceId: string,
  ) {
    return this.provenance.attachSourceToContent(contentItemId, sourceId);
  }

  @Get('content/:contentItemId/compliance')
  compliance(@Param('contentItemId') contentItemId: string) {
    return this.provenance.checkCompliance(contentItemId);
  }
}
