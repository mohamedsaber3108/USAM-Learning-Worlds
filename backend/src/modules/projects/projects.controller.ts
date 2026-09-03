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

  @Get('real-world-challenges/list')
  async listRealWorldChallenges() {
    return this.projectsService.listRealWorldChallenges();
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

  // ==================== Milestone stage machine ====================

  @Get(':id/milestones')
  async listMilestones(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.listMilestones(id, user.learner?.id);
  }

  @Put(':id/milestones/:milestoneId')
  async updateMilestone(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: { status: string },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) {
      throw new Error('Only learners can update milestones');
    }
    return this.projectsService.updateMilestoneStatus(id, milestoneId, learnerId, body.status);
  }

  // ==================== Collaboration Engine ====================

  @Post(':id/collaborators')
  async addCollaborator(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { learnerId: string; role?: 'EDITOR' | 'COMMENTER' },
  ) {
    return this.projectsService.addCollaborator(id, user.learner?.id, body.learnerId, body.role);
  }

  @Get(':id/collaborators')
  async listCollaborators(@Param('id') id: string) {
    return this.projectsService.listCollaborators(id);
  }

  @Delete(':id/collaborators/:learnerId')
  async removeCollaborator(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('learnerId') learnerId: string,
  ) {
    return this.projectsService.removeCollaborator(id, user.learner?.id, learnerId);
  }

  // ==================== Research Engine ====================

  @Post(':id/research-notes')
  async addResearchNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { content: string; sourceTitle?: string; sourceUrl?: string },
  ) {
    return this.projectsService.addResearchNote(id, user.learner?.id, body);
  }

  @Get(':id/research-notes')
  async listResearchNotes(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.listResearchNotes(id, user.learner?.id);
  }

  @Delete('research-notes/:noteId')
  async deleteResearchNote(@CurrentUser() user: any, @Param('noteId') noteId: string) {
    return this.projectsService.deleteResearchNote(noteId, user.learner?.id);
  }
}
