import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConceptService } from './services/concept.service';
import { LearningPathService } from './services/learning-path.service';
import { ContentAdaptationService } from './services/content-adaptation.service';
import { LearningEventService } from './services/learning-event.service';
import { AgeBand, PrerequisiteType, ScaffoldLevel } from '@prisma/client';

@Controller('api/learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(
    private conceptService: ConceptService,
    private learningPathService: LearningPathService,
    private contentAdaptationService: ContentAdaptationService,
    private learningEventService: LearningEventService
  ) {}

  // ============================================
  // CONCEPTS & PREREQUISITES
  // ============================================

  @Get('concepts')
  async getConcepts(@Query('competencyId') competencyId?: string) {
    return this.conceptService.findAll(competencyId);
  }

  @Get('concepts/:id')
  async getConcept(@Param('id') id: string) {
    return this.conceptService.findOne(id);
  }

  @Get('concepts/slug/:slug')
  async getConceptBySlug(@Param('slug') slug: string) {
    return this.conceptService.findBySlug(slug);
  }

  @Get('concepts/:id/prerequisites')
  async getPrerequisiteChain(@Param('id') id: string) {
    return this.conceptService.getPrerequisiteChain(id);
  }

  @Get('concepts/:id/unlock-status')
  async getUnlockStatus(@Param('id') id: string, @Request() req: any) {
    const learnerId = req.user.learnerId;
    return this.conceptService.getUnlockStatus(id, learnerId);
  }

  @Post('concepts/:id/prerequisites')
  async addPrerequisite(
    @Param('id') id: string,
    @Body() body: { prerequisiteId: string; type?: PrerequisiteType }
  ) {
    return this.conceptService.addPrerequisite(id, body.prerequisiteId, body.type);
  }

  @Delete('concepts/:id/prerequisites/:prereqId')
  async removePrerequisite(@Param('id') id: string, @Param('prereqId') prereqId: string) {
    return this.conceptService.removePrerequisite(id, prereqId);
  }

  @Get('skills/:skillId/concepts')
  async getConceptsForSkill(@Param('skillId') skillId: string) {
    return this.conceptService.getConceptsForSkill(skillId);
  }

  @Get('domains/:domainId/concepts')
  async getConceptsForDomain(@Param('domainId') domainId: string) {
    return this.conceptService.getConceptsForDomain(domainId);
  }

  // ============================================
  // LEARNING PATHS
  // ============================================

  @Get('paths')
  async getLearningPaths(
    @Query('domainId') domainId?: string,
    @Query('ageBand') ageBand?: AgeBand
  ) {
    return this.learningPathService.findAll(domainId, ageBand);
  }

  @Get('paths/:id')
  async getLearningPath(@Param('id') id: string) {
    return this.learningPathService.findOne(id);
  }

  @Get('paths/:id/progress')
  async getPathProgress(@Param('id') id: string, @Request() req: any) {
    const learnerId = req.user.learnerId;
    return this.learningPathService.getProgress(id, learnerId);
  }

  @Post('paths/:id/advance')
  async advancePathProgress(
    @Param('id') id: string,
    @Body() body: { nodeId: string },
    @Request() req: any
  ) {
    const learnerId = req.user.learnerId;
    return this.learningPathService.advanceProgress(id, learnerId, body.nodeId);
  }

  @Post('paths/:id/reset')
  async resetPathProgress(@Param('id') id: string, @Request() req: any) {
    const learnerId = req.user.learnerId;
    return this.learningPathService.resetProgress(id, learnerId);
  }

  @Get('paths/recommend')
  async recommendPath(@Query('domainId') domainId: string | undefined, @Request() req: any) {
    const learnerId = req.user.learnerId;
    return this.learningPathService.recommendPath(learnerId, domainId);
  }

  @Get('my-paths')
  async getMyPaths(@Request() req: any) {
    const learnerId = req.user.learnerId;
    return this.learningPathService.getLearnerPaths(learnerId);
  }

  // ============================================
  // AGE ADAPTATION
  // ============================================

  @Get('adapted/:entityType/:entityId')
  async getAdaptedContent(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Request() req: any
  ) {
    const learner = await this.getLearnerFromRequest(req);
    const ageBand = learner.ageBand as AgeBand;

    switch (entityType.toUpperCase()) {
      case 'ACTIVITY':
        return this.contentAdaptationService.getAdaptedActivity(entityId, ageBand);
      case 'OBJECTIVE':
        return this.contentAdaptationService.getAdaptedObjective(entityId, ageBand);
      case 'MISSION':
        return this.contentAdaptationService.getAdaptedMission(entityId, ageBand);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  @Get('age-config/:ageBand')
  async getAgeConfig(@Param('ageBand') ageBand: AgeBand) {
    return this.contentAdaptationService.getAgeConfig(ageBand);
  }

  @Get('age-configs')
  async getAllAgeConfigs() {
    return this.contentAdaptationService.getAllAgeConfigs();
  }

  @Post('age-variants')
  async createAgeVariant(
    @Body()
    body: {
      entityType: string;
      entityId: string;
      ageBand: AgeBand;
      framing: string;
      languageLevel?: string;
      scaffoldLevel?: ScaffoldLevel;
      surface?: string;
      content?: any;
    }
  ) {
    return this.contentAdaptationService.createAgeVariant(
      body.entityType,
      body.entityId,
      body.ageBand,
      {
        framing: body.framing,
        languageLevel: body.languageLevel,
        scaffoldLevel: body.scaffoldLevel,
        surface: body.surface,
        content: body.content,
      }
    );
  }

  @Get('variant-coverage/:entityType')
  async getVariantCoverage(@Param('entityType') entityType: string) {
    return this.contentAdaptationService.getVariantCoverage(entityType);
  }

  // ============================================
  // LEARNING EVENTS
  // ============================================

  @Post('events')
  async recordEvent(@Body() event: any, @Request() req: any) {
    const learnerId = req.user.learnerId;
    return this.learningEventService.recordEvent({
      learnerId,
      ...event,
    });
  }

  @Get('events')
  async getEvents(@Request() req: any, @Query() options: any) {
    const learnerId = req.user.learnerId;
    return this.learningEventService.getEventsForLearner(learnerId, {
      type: options.type,
      entityType: options.entityType,
      entityId: options.entityId,
      sessionId: options.sessionId,
      limit: options.limit ? parseInt(options.limit) : undefined,
      offset: options.offset ? parseInt(options.offset) : undefined,
      since: options.since ? new Date(options.since) : undefined,
    });
  }

  @Get('events/stats')
  async getEventStats(@Request() req: any, @Query('since') since?: string) {
    const learnerId = req.user.learnerId;
    return this.learningEventService.getEventStats(
      learnerId,
      since ? new Date(since) : undefined
    );
  }

  @Get('events/recent')
  async getRecentActivity(@Request() req: any, @Query('hours') hours?: string) {
    const learnerId = req.user.learnerId;
    return this.learningEventService.getRecentActivity(
      learnerId,
      hours ? parseInt(hours) : 24
    );
  }

  @Get('events/session/:sessionId')
  async getSessionSummary(@Param('sessionId') sessionId: string) {
    return this.learningEventService.getSessionSummary(sessionId);
  }

  @Get('events/patterns')
  async getLearningPatterns(@Request() req: any, @Query('days') days?: string) {
    const learnerId = req.user.learnerId;
    return this.learningEventService.getLearningPatterns(
      learnerId,
      days ? parseInt(days) : 30
    );
  }

  private async getLearnerFromRequest(req: any) {
    const prisma = (this.conceptService as any).prisma;
    return prisma.learner.findUnique({
      where: { userId: req.user.userId },
      select: { id: true, ageBand: true },
    });
  }
}
