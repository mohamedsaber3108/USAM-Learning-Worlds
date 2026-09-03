/**
 * Cross-Curricular Concepts Controller
 *
 * Serves the three real cross-curricular content models that were seeded
 * with age-banded content (backend/prisma/seeds/seed-cross-curricular.ts,
 * commit e25da26) but had no delivery layer:
 *   - AILiteracyConcept        (18 rows, table ai_literacy_concepts)
 *   - EntrepreneurshipConcept  (15 rows, table entrepreneurship_concepts)
 *   - FinancialLiteracyConcept (19 rows, table financial_literacy_concepts)
 *   - DigitalLiteracyConcept   (28 rows, table digital_literacy_concepts)
 *   - CareerExplorationConcept (13 rows, table career_exploration_concepts —
 *     built from scratch this pass, was a zero-trace "Missing" engine per
 *     USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b)
 *
 * Follows the same convention as EnglishController
 * (backend/src/modules/learning/english.controller.ts): thin, read-only,
 * PrismaService injected directly, optional query-param filter, single-item
 * lookup by slug.
 */
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AgeBand } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

type CrossCurricularCategory =
  | 'ai-literacy'
  | 'entrepreneurship'
  | 'financial-literacy'
  | 'digital-literacy'
  | 'career-exploration';

@Controller('cross-curricular')
@UseGuards(JwtAuthGuard)
export class CrossCurricularController {
  constructor(private prisma: PrismaService) {}

  /**
   * List AI Literacy concepts, optionally filtered by age band.
   * Real data from `ai_literacy_concepts` (18 seeded rows).
   */
  @Get('ai-literacy')
  async listAiLiteracy(@Query('ageBand') ageBand?: AgeBand) {
    const where = ageBand
      ? { ageAppropriate: ageBand, isActive: true }
      : { isActive: true };

    return this.prisma.aILiteracyConcept.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * List Entrepreneurship concepts, optionally filtered by age band.
   * Real data from `entrepreneurship_concepts` (15 seeded rows).
   */
  @Get('entrepreneurship')
  async listEntrepreneurship(@Query('ageBand') ageBand?: AgeBand) {
    const where = ageBand
      ? { ageAppropriate: ageBand, isActive: true }
      : { isActive: true };

    return this.prisma.entrepreneurshipConcept.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * List Financial Literacy concepts, optionally filtered by age band.
   * Real data from `financial_literacy_concepts` (19 seeded rows).
   */
  @Get('financial-literacy')
  async listFinancialLiteracy(@Query('ageBand') ageBand?: AgeBand) {
    const where = ageBand
      ? { ageAppropriate: ageBand, isActive: true }
      : { isActive: true };

    return this.prisma.financialLiteracyConcept.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * List Digital Literacy concepts, optionally filtered by age band.
   * Real data from `digital_literacy_concepts`
   * (backend/prisma/seeds/seed-digital-literacy.ts, ~28 seeded rows covering
   * online safety, misinformation, privacy, digital citizenship, ads vs.
   * content, account safety, and screen-time self-awareness).
   */
  @Get('digital-literacy')
  async listDigitalLiteracy(@Query('ageBand') ageBand?: AgeBand) {
    const where = ageBand
      ? { ageAppropriate: ageBand, isActive: true }
      : { isActive: true };

    return this.prisma.digitalLiteracyConcept.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * List Career Exploration concepts, optionally filtered by age band.
   * Real data from `career_exploration_concepts`
   * (backend/prisma/seeds/seed-career-exploration.ts, 13 seeded rows
   * covering roles like scientist, engineer, artist, entrepreneur, doctor,
   * teacher, etc. — what they do plus what school subjects help you get
   * there). Was a zero-trace "Missing" engine per
   * USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b before this pass.
   */
  @Get('career-exploration')
  async listCareerExploration(@Query('ageBand') ageBand?: AgeBand) {
    const where = ageBand
      ? { ageAppropriate: ageBand, isActive: true }
      : { isActive: true };

    return this.prisma.careerExplorationConcept.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Single concept detail by category + slug, e.g.
   * GET /cross-curricular/ai-literacy/what-is-artificial-intelligence
   */
  @Get(':category/:slug')
  async getConcept(
    @Param('category') category: CrossCurricularCategory,
    @Param('slug') slug: string,
  ) {
    let concept: unknown = null;

    switch (category) {
      case 'ai-literacy':
        concept = await this.prisma.aILiteracyConcept.findUnique({
          where: { slug },
        });
        break;
      case 'entrepreneurship':
        concept = await this.prisma.entrepreneurshipConcept.findUnique({
          where: { slug },
        });
        break;
      case 'financial-literacy':
        concept = await this.prisma.financialLiteracyConcept.findUnique({
          where: { slug },
        });
        break;
      case 'digital-literacy':
        concept = await this.prisma.digitalLiteracyConcept.findUnique({
          where: { slug },
        });
        break;
      case 'career-exploration':
        concept = await this.prisma.careerExplorationConcept.findUnique({
          where: { slug },
        });
        break;
      default:
        throw new NotFoundException(`Unknown category: ${category}`);
    }

    if (!concept) {
      throw new NotFoundException(
        `No ${category} concept found for slug "${slug}"`,
      );
    }

    return concept;
  }
}
