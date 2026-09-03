import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from './dto/project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async createProject(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can create projects');
    }

    return this.projectsService.createProject(learnerId, dto);
  }

  @Get('my')
  async getMyProjects(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners have projects');
    }

    return this.projectsService.getMyProjects(learnerId);
  }

  @Get('browse')
  async browseProjects(
    @Query('type') type?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.browseProjects({
      type,
      tags: tags ? tags.split(',') : undefined,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('portfolio/:learnerId')
  async getPortfolio(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
  ) {
    const requestingLearnerId = user.learner?.id;
    return this.projectsService.getPortfolio(learnerId, requestingLearnerId);
  }

  @Get(':id')
  async getProject(@CurrentUser() user: any, @Param('id') id: string) {
    const requestingLearnerId = user.learner?.id;
    return this.projectsService.getProject(id, requestingLearnerId);
  }

  @Get(':id/curriculum-context')
  async getProjectCurriculumContext(@Param('id') id: string) {
    return this.projectsService.getProjectCurriculumContext(id);
  }

  @Put(':id')
  async updateProject(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can update projects');
    }

    return this.projectsService.updateProject(id, learnerId, dto);
  }

  @Delete(':id')
  async deleteProject(@CurrentUser() user: any, @Param('id') id: string) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can delete projects');
    }

    return this.projectsService.deleteProject(id, learnerId);
  }

  @Post(':id/showcase')
  async showcaseProject(@CurrentUser() user: any, @Param('id') id: string) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can showcase projects');
    }

    return this.projectsService.showcaseProject(id, learnerId);
  }
}
