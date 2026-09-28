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
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('english')
@UseGuards(JwtAuthGuard)
export class EnglishController {
  constructor(private prisma: PrismaService) {}

  /**
   * The English LEARNING PATH (Option A — the shared spine, not a catalog).
   * Returns the English domain's skills -> competencies (tagged with CEFR),
   * and for each competency the first mission reachable through its
   * objectives->activities->missionActivities, plus the learner's real
   * MasteryRecord state. This is what makes English a real domain: a learner
   * follows competencies into real missions that produce evidence + mastery
   * through the shared engine.
   */
  @Get('path')
  async getLearningPath(@CurrentUser() user: any) {
    const learnerId = user?.learner?.id ?? null;

    const domain = await this.prisma.domain.findUnique({
      where: { slug: 'english' },
      include: {
        skills: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            competencies: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                objectives: {
                  where: { isActive: true },
                  include: {
                    activities: {
                      where: { isActive: true },
                      include: { missionActivities: { include: { mission: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!domain) return { domain: null, skills: [] };

    const competencyIds: string[] = [];
    for (const s of domain.skills) for (const c of s.competencies) competencyIds.push(c.id);
    const mastery = learnerId
      ? await this.prisma.masteryRecord.findMany({
          where: { learnerId, competencyId: { in: competencyIds } },
          select: { competencyId: true, state: true, confidence: true },
        })
      : [];
    const masteryByComp = new Map(mastery.map((m) => [m.competencyId, m]));

    const skills = domain.skills.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      competencies: s.competencies.map((c) => {
        let missionId: string | null = null;
        let missionTitle: string | null = null;
        for (const o of c.objectives) {
          for (const a of o.activities) {
            const ma = a.missionActivities[0];
            if (ma?.mission) {
              missionId = ma.mission.id;
              missionTitle = ma.mission.title;
              break;
            }
          }
          if (missionId) break;
        }
        const m = masteryByComp.get(c.id);
        return {
          id: c.id,
          name: c.name,
          description: c.description,
          cefrLevel: (c as any).cefrLevel ?? null,
          missionId,
          missionTitle,
          masteryState: m?.state ?? 'NOT_STARTED',
          confidence: m?.confidence ?? 0,
        };
      }),
    }));

    return { domain: { id: domain.id, name: domain.name, slug: domain.slug }, skills };
  }

  /**
   * List English strands, optionally filtered by CEFR level or by the
   * real `strandType` enum column (VOCABULARY/GRAMMAR/PRONUNCIATION/
   * LISTENING/READING/WRITING/SPEAKING/SHADOWING/DICTATION), replacing
   * the frontend's previous name-string-parsing (see gap matrix's
   * Vocabulary Engine row).
   */
  @Get('strands')
  async listStrands(
    @Query('cefrLevel') cefrLevel?: string,
    @Query('strandType') strandType?: string,
  ) {
    const where: any = { isActive: true };
    if (cefrLevel) where.cefrLevel = cefrLevel;
    if (strandType) where.strandType = strandType;

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
