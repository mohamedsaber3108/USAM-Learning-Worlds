import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ExperimentationService } from './experimentation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Experimentation Engine v1 REST surface.
 *
 * - Staff-only endpoints to create/list experiments and change status.
 * - `GET /experiments/:key/assignment/:learnerId` is the read path other
 *   services/front-end code would call to find out which variant a
 *   learner is in (assigning them on first call). A learner may only
 *   fetch their OWN assignment; staff can fetch anyone's.
 *
 * No outcome/results endpoint is included here — see the header comment
 * on ExperimentationService for why (outcome analysis belongs on top of
 * the existing LearningEvent table, not a new metrics system).
 */
@Controller('experiments')
@UseGuards(JwtAuthGuard)
export class ExperimentationController {
  constructor(private experiments: ExperimentationService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new ForbiddenException('Only staff can list experiments');
    }
    return this.experiments.listExperiments();
  }

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: { key: string; name: string; description?: string; variants: string[] },
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can create experiments');
    }
    return this.experiments.createExperiment(dto);
  }

  @Patch(':key/status')
  async setStatus(
    @CurrentUser() user: any,
    @Param('key') key: string,
    @Body() dto: { status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' },
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can change experiment status');
    }
    return this.experiments.setStatus(key, dto.status);
  }

  @Get(':key/assignment/:learnerId')
  async getAssignment(
    @CurrentUser() user: any,
    @Param('key') key: string,
    @Param('learnerId') learnerId: string,
  ) {
    const isSelf = user.learnerId === learnerId;
    const isStaff = user.role === 'ADMIN' || user.role === 'MODERATOR';

    if (!isSelf && !isStaff) {
      throw new ForbiddenException("Cannot view another learner's experiment assignment");
    }

    const variant = await this.experiments.getOrAssignVariant(key, learnerId);
    return { experimentKey: key, learnerId, variant };
  }
}
