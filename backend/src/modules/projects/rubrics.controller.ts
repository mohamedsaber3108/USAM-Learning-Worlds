import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RubricsService } from './rubrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * GET /rubrics - browse available rubric templates
 */
@Controller('rubrics')
@UseGuards(JwtAuthGuard)
export class RubricsController {
  constructor(private rubricsService: RubricsService) {}

  @Get()
  async listRubrics() {
    return this.rubricsService.listRubrics();
  }
}

/**
 * GET /projects/:id/rubric - the rubric attached to a specific project
 */
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectRubricController {
  constructor(private rubricsService: RubricsService) {}

  @Get(':id/rubric')
  async getRubricForProject(@Param('id') id: string) {
    return this.rubricsService.getRubricForProject(id);
  }
}
