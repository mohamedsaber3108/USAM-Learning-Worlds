import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgeBand, SimulationCategory } from '@prisma/client';

@Controller('simulations')
@UseGuards(JwtAuthGuard)
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @Get()
  async list(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('category') category?: SimulationCategory,
  ) {
    return this.simulationService.listScenarios(ageBand, category);
  }

  @Get(':slug')
  async getScenario(@Param('slug') slug: string) {
    return this.simulationService.getScenario(slug);
  }

  @Get(':scenarioId/nodes/:nodeKey')
  async getNode(@Param('scenarioId') scenarioId: string, @Param('nodeKey') nodeKey: string) {
    return this.simulationService.getNode(scenarioId, nodeKey);
  }
}
