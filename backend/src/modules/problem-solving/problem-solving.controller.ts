/**
 * Problem Solving Engine + Computational Thinking Engine Controller
 *
 * Both zero-trace per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b — built from
 * scratch. Mirrors cross-curricular.controller.ts's AI-Literacy delivery
 * exactly (thin, read-only, PrismaService injected directly, optional
 * ageBand/category filters, single-item lookup by slug), serving the real
 * seeded `ProblemSolvingConcept` content
 * (prisma/seeds/seed-problem-solving.ts, 15 rows across DECOMPOSITION /
 * PATTERN_RECOGNITION / ABSTRACTION / ALGORITHM_DESIGN categories).
 */
import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AgeBand } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('problem-solving')
@UseGuards(JwtAuthGuard)
export class ProblemSolvingController {
  constructor(private prisma: PrismaService) {}

  /**
   * List Problem Solving / Computational Thinking concepts, optionally
   * filtered by age band and/or category
   * (DECOMPOSITION | PATTERN_RECOGNITION | ABSTRACTION | ALGORITHM_DESIGN).
   */
  @Get()
  async list(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('category') category?: string,
  ) {
    return this.prisma.problemSolvingConcept.findMany({
      where: {
        isActive: true,
        ...(ageBand ? { ageAppropriate: ageBand } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  /** Distinct categories present, for building a filter UI. */
  @Get('categories')
  async listCategories() {
    const rows = await this.prisma.problemSolvingConcept.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return rows.map((r) => r.category);
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    const concept = await this.prisma.problemSolvingConcept.findUnique({ where: { slug } });
    if (!concept) {
      throw new NotFoundException('Problem solving concept not found');
    }
    return concept;
  }
}
