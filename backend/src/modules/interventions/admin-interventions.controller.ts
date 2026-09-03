import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { InterventionService } from './intervention.service';

@Controller('admin/interventions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
export class AdminInterventionsController {
  constructor(private interventionService: InterventionService) {}

  @Get()
  async listOpen(@Query('take') take?: string) {
    return this.interventionService.listOpen(take ? parseInt(take, 10) : undefined);
  }

  @Get('learner/:learnerId')
  async listForLearner(@Param('learnerId') learnerId: string, @Query('status') status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') {
    return this.interventionService.listForLearner(learnerId, status);
  }

  @Patch(':id/acknowledge')
  async acknowledge(@Param('id') id: string) {
    return this.interventionService.setStatus(id, 'ACKNOWLEDGED');
  }

  @Patch(':id/resolve')
  async resolve(@Param('id') id: string) {
    return this.interventionService.setStatus(id, 'RESOLVED');
  }
}
