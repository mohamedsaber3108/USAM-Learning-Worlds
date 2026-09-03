import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurriculumMappingService } from './curriculum-mapping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Automatic Curriculum Mapping Engine v1 — admin-only endpoints.
 *
 * POST /api/admin/curriculum-mapping/suggest
 *   body: { title: string, description?: string, take?: number }
 *   -> ranked LearningObjective suggestions for arbitrary free-text.
 *
 * GET  /api/admin/curriculum-mapping/content-items/:id/suggest
 *   -> ranked suggestions for an existing ContentItem's own title/metadata.
 *
 * POST /api/admin/curriculum-mapping/content-items/:id/apply
 *   body: { objectiveId, domainId }
 *   -> writes the confirmed objectiveId/domainId onto the ContentItem.
 *   Explicit human confirmation required — this engine never
 *   auto-commits a suggestion on its own.
 */
@Controller('admin/curriculum-mapping')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CurriculumMappingController {
  constructor(private curriculumMapping: CurriculumMappingService) {}

  @Post('suggest')
  async suggest(
    @Body() body: { title: string; description?: string; take?: number },
  ) {
    return this.curriculumMapping.suggest(body.title, body.description, body.take);
  }

  @Get('content-items/:id/suggest')
  async suggestForContentItem(@Param('id') id: string, @Query('take') take?: string) {
    return this.curriculumMapping.suggestForContentItem(id, take ? parseInt(take, 10) : undefined);
  }

  @Post('content-items/:id/apply')
  async apply(
    @Param('id') id: string,
    @Body() body: { objectiveId: string; domainId: string },
  ) {
    return this.curriculumMapping.applySuggestion(id, body.objectiveId, body.domainId);
  }
}
