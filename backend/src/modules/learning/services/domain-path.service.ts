import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Shared DOMAIN learning-path projection over the canonical spine.
 *
 * This is the GENERIC engine behind every domain's "path" view — it does NOT
 * know anything English- or Coding-specific. Given a domain slug and a learner,
 * it derives:
 *   Domain → Skills → Competencies → (first reachable Mission via
 *   objectives→activities→missionActivities) + the learner's real MasteryRecord.
 *
 * Domain-specific metadata only DECORATES the result (e.g. English competencies
 * carry a cefrLevel pulled from their linked EnglishStrand). Core progression
 * logic stays here and is shared, per the Option-A canonical-spine rule:
 * one path engine, not one per domain.
 *
 * NB: distinct from the older `LearningPathService`, which manages the separate
 * `LearningPath`/`LearningPathNode` CRUD models (authored curriculum paths).
 * This service derives the path live from the mastery graph.
 *
 * Consumed by:
 *   - GET /learning/domains/:slug/path  (generic, preferred)
 *   - GET /english/path                 (back-compat shim → getPath('english'))
 */
@Injectable()
export class DomainPathService {
  constructor(private prisma: PrismaService) {}

  async getPath(domainSlug: string, learnerId: string | null) {
    const domain = await this.prisma.domain.findUnique({
      where: { slug: domainSlug },
      include: {
        skills: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            competencies: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                // Domain metadata decorator: English competencies link to an
                // EnglishStrand that owns the CEFR level (source of truth).
                // Null for non-English domains — the projection stays generic.
                strand: { select: { cefrLevel: true, strandType: true } },
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
      competencies: s.competencies.map((c: any) => {
        // First mission reachable through this competency's objectives→activities.
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
          // Generic metadata decoration (null when the domain has no strand).
          cefrLevel: c.strand?.cefrLevel ?? null,
          strandType: c.strand?.strandType ?? null,
          missionId,
          missionTitle,
          masteryState: m?.state ?? 'NOT_STARTED',
          confidence: m?.confidence ?? 0,
        };
      }),
    }));

    return { domain: { id: domain.id, name: domain.name, slug: domain.slug }, skills };
  }
}
