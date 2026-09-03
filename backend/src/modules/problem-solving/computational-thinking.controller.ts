/**
 * Computational Thinking Engine Controller
 *
 * NOTE: distinct from ProblemSolvingConcept (which already covers
 * decomposition/pattern-recognition/abstraction/algorithm-design under a
 * combined Problem Solving + Computational Thinking umbrella per
 * seed-problem-solving.ts). This controller serves the separate
 * ComputationalThinkingConcept model added by the wip-stash-0 recovery
 * pass (Tick 17) — kept as its own real, seeded table
 * (prisma/seeds/seed-computational-thinking.ts, 14 rows) per
 * USAM_KIDS_ENGINE_GAP_MATRIX.md. Mirrors problem-solving.controller.ts's
 * shape exactly (thin, read-only, PrismaService injected directly).
 */
import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AgeBand } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('computational-thinking')
@UseGuards(JwtAuthGuard)
export class ComputationalThinkingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('category') category?: string,
  ) {
    return this.prisma.computationalThinkingConcept.findMany({
      where: {
        isActive: true,
        ...(ageBand ? { ageAppropriate: ageBand } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  @Get('categories')
  async listCategories() {
    const rows = await this.prisma.computationalThinkingConcept.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return rows.map((r) => r.category);
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    const concept = await this.prisma.computationalThinkingConcept.findUnique({ where: { slug } });
    if (!concept) {
      throw new NotFoundException('Computational thinking concept not found');
    }
    return concept;
  }
}
