import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RubricsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the rubric attached to a project (polymorphic entityType/entityId link)
   */
  async getRubricForProject(projectId: string) {
    return this.prisma.rubric.findFirst({
      where: {
        entityType: 'PROJECT',
        entityId: projectId,
      },
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * List all available rubric templates (for browsing)
   */
  async listRubrics() {
    return this.prisma.rubric.findMany({
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
