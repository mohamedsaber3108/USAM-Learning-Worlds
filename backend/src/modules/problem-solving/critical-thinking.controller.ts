/**
 * Critical Thinking Engine Controller
 *
 * Zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b — built
 * from scratch (Tick 17), serving the real seeded CriticalThinkingConcept
 * content (prisma/seeds/seed-critical-thinking.ts, 15 rows covering bias,
 * evidence evaluation, fact vs opinion, logical fallacies for kids,
 * source questioning, cause vs correlation). Mirrors
 * problem-solving.controller.ts's shape exactly.
 */
import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AgeBand } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('critical-thinking')
@UseGuards(JwtAuthGuard)
export class CriticalThinkingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('category') category?: string,
  ) {
    return this.prisma.criticalThinkingConcept.findMany({
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
    const rows = await this.prisma.criticalThinkingConcept.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return rows.map((r) => r.category);
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    const concept = await this.prisma.criticalThinkingConcept.findUnique({ where: { slug } });
    if (!concept) {
      throw new NotFoundException('Critical thinking concept not found');
    }
    return concept;
  }
}
