import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AgeBand, SimulationCategory } from '@prisma/client';

@Injectable()
export class SimulationService {
  constructor(private prisma: PrismaService) {}

  async listScenarios(ageBand?: AgeBand, category?: SimulationCategory) {
    return this.prisma.simulationScenario.findMany({
      where: {
        isActive: true,
        ...(ageBand ? { ageAppropriate: ageBand } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  async getScenario(slug: string) {
    const scenario = await this.prisma.simulationScenario.findUnique({
      where: { slug },
      include: { nodes: true },
    });
    if (!scenario) throw new NotFoundException('Simulation scenario not found');
    return scenario;
  }

  async getNode(scenarioId: string, nodeKey: string) {
    const node = await this.prisma.simulationDecisionPoint.findUnique({
      where: { scenarioId_nodeKey: { scenarioId, nodeKey } },
    });
    if (!node) throw new NotFoundException('Decision node not found');
    return node;
  }
}
