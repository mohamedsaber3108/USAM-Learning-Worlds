/**
 * English Strands Controller
 *
 * Serves the real `EnglishStrand` content model (45 seeded rows across the
 * 9 strand types: Vocabulary, Grammar, Pronunciation, Listening, Reading,
 * Writing, Speaking, Shadowing, Dictation — CEFR A1-B2). This controller
 * was previously a disabled empty class (see git history: wrong import
 * paths for JwtAuthGuard/PrismaService, and `req.user.learnerId` instead
 * of `req.user.learner.id` — same systemic bug fixed elsewhere in commit
 * da4f243). Re-enabled here with those bugs fixed; read-only, no learner
 * write paths, so no risk to other in-flight backend work.
 */
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('english')
@UseGuards(JwtAuthGuard)
export class EnglishController {
  constructor(private prisma: PrismaService) {}

  /**
   * List English strands, optionally filtered by CEFR level.
   * Real data from the `english_strands` table (45 rows, 9 strand
   * families x CEFR A1-B2 progression).
   */
  @Get('strands')
  async listStrands(@Query('cefrLevel') cefrLevel?: string) {
    const where = cefrLevel
      ? { cefrLevel, isActive: true }
      : { isActive: true };

    return this.prisma.englishStrand.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /** Single strand by slug. */
  @Get('strands/:slug')
  async getStrand(@Param('slug') slug: string) {
    return this.prisma.englishStrand.findUnique({
      where: { slug },
    });
  }
}
