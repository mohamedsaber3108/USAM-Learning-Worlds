/**
 * Story Engine Controller — gap matrix cluster-8.
 *
 * A deliberately small, real branching-story API: list stories (optionally
 * filtered by ageBand/domain), and fetch one story with all its pages so
 * the frontend reader can walk the choiceOptions tree client-side.
 *
 * Story Branching Engine gap is satisfied by the same `choiceOptions` Json
 * column on StoryPage — no separate branching-engine endpoint exists or is
 * needed.
 */
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private prisma: PrismaService) {}

  /** List active stories, optionally filtered by ageBand or domain slug. */
  @Get()
  async listStories(
    @Query('ageBand') ageBand?: string,
    @Query('domainSlug') domainSlug?: string,
  ) {
    const where: any = { isActive: true };
    if (ageBand) where.ageBand = ageBand;
    if (domainSlug) where.domain = { slug: domainSlug };

    return this.prisma.story.findMany({
      where,
      include: {
        domain: { select: { name: true, slug: true, icon: true, color: true } },
        _count: { select: { pages: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Single story with every page (pages are small, so return them all —
   * the frontend reader walks the choiceOptions tree client-side rather
   * than needing a page-by-page endpoint). */
  @Get(':id')
  async getStory(@Param('id') id: string) {
    return this.prisma.story.findUnique({
      where: { id },
      include: {
        domain: { select: { name: true, slug: true, icon: true, color: true } },
        pages: { orderBy: { pageNumber: 'asc' } },
      },
    });
  }
}
