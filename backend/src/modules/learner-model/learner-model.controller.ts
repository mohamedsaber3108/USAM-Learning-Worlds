import { Controller, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { LearnerModelService } from './learner-model.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';

/**
 * Learner Model Engine controller.
 *
 * Exposes the learner's state as a standalone, stable contract:
 *   GET /learner-model/:id -> { ageBand, masterySnapshot, preferences, zpdProfile }
 *
 * Consumable by any engine or the frontend independently of the AI
 * module. Access is restricted to the learner themself, a linked
 * guardian, or staff (ADMIN/MODERATOR) — same access model used
 * elsewhere in the app (see ParentsService.verifyRelationship).
 */
@Controller('learner-model')
@UseGuards(JwtAuthGuard)
export class LearnerModelController {
  constructor(
    private learnerModelService: LearnerModelService,
    private prisma: PrismaService,
  ) {}

  @Get(':id')
  async getLearnerModel(@CurrentUser() user: any, @Param('id') id: string) {
    await this.verifyAccess(user, id);
    return this.learnerModelService.getLearnerModel(id);
  }

  private async verifyAccess(user: any, learnerId: string): Promise<void> {
    if (user.learner?.id === learnerId) {
      return;
    }

    if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
      return;
    }

    if (user.guardian?.id) {
      const relationship = await this.prisma.guardianship.findFirst({
        where: {
          guardianId: user.guardian.id,
          learnerId,
          status: 'ACTIVE',
        },
      });
      if (relationship) {
        return;
      }
    }

    throw new ForbiddenException('No access to this learner model');
  }
}
