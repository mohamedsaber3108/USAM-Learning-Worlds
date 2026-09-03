import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Automatic Curriculum Mapping Engine — v1.
 *
 * Gap Matrix row ("Automatic Curriculum Mapping", Part 9/Infra section):
 * the real Domain -> Skill -> Competency -> LearningObjective hierarchy
 * (Part 1 row 3) is entirely manually authored via seed scripts; nothing
 * automates *placing* new content into it. This is deliberately NOT an
 * NLP/embedding-based classifier (that would duplicate the already-
 * deferred Semantic Search/RAG infra gap, which needs a vector store
 * this repo doesn't have yet). It is a real, honest v1: a keyword-overlap
 * suggester that scores every candidate LearningObjective's own name
 * (and its parent Competency/Skill/Domain names) against tokens from the
 * content's title/description, and returns ranked suggestions for a
 * human editor to confirm — same "suggest, don't auto-commit" pattern as
 * the recommendation engine uses for missions, just applied to authoring
 * instead of learner-facing recommendations.
 *
 * This directly closes the loop with the Content Ingestion / ContentItem
 * Authoring Engine (content-items module): an author creates a
 * ContentItem with just a title/description, calls this engine's
 * `suggest()` to get ranked objectiveId candidates, then PATCHes the
 * ContentItem with the confirmed objectiveId+domainId — no guessing,
 * no silent auto-assignment.
 */

export interface MappingSuggestion {
  objectiveId: string;
  objectiveName: string;
  competencyId: string;
  competencyName: string;
  skillId: string;
  skillName: string;
  domainId: string;
  domainName: string;
  score: number;
  matchedTokens: string[];
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
  'is', 'are', 'this', 'that', 'it', 'its', 'as', 'by', 'be', 'your',
  'you', 'i', 'we', 'up', 'at', 'from', 'into',
]);

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

@Injectable()
export class CurriculumMappingService {
  private readonly logger = new Logger(CurriculumMappingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Rank every real LearningObjective (joined up through its real
   * Competency -> Skill -> Domain chain) by token overlap against the
   * supplied title/description text. Pure read, no writes — the caller
   * (a human editor) decides which suggestion, if any, to apply.
   */
  async suggest(
    title: string,
    description?: string,
    take = 5,
  ): Promise<{ queryTokens: string[]; suggestions: MappingSuggestion[] }> {
    const queryTokens = Array.from(
      new Set([...tokenize(title), ...tokenize(description || '')]),
    );

    if (queryTokens.length === 0) {
      return { queryTokens: [], suggestions: [] };
    }

    const objectives = await this.prisma.learningObjective.findMany({
      where: { isActive: true },
      include: {
        competency: {
          include: {
            skill: {
              include: { domain: true },
            },
          },
        },
      },
    });

    const scored: MappingSuggestion[] = [];

    for (const obj of objectives) {
      const comp = obj.competency;
      const skill = comp?.skill;
      const domain = skill?.domain;
      if (!comp || !skill || !domain) continue;

      const haystack = [obj.name, obj.description, comp.name, skill.name, domain.name]
        .filter(Boolean)
        .join(' ');
      const hayTokens = new Set(tokenize(haystack));

      const matched = queryTokens.filter((t) => hayTokens.has(t));
      if (matched.length === 0) continue;

      // Score: fraction of query tokens matched, weighted slightly by
      // absolute match count so a long, highly specific overlap beats a
      // short query matching one generic word on a huge hierarchy.
      const score = matched.length / queryTokens.length + matched.length * 0.01;

      scored.push({
        objectiveId: obj.id,
        objectiveName: obj.name,
        competencyId: comp.id,
        competencyName: comp.name,
        skillId: skill.id,
        skillName: skill.name,
        domainId: domain.id,
        domainName: domain.name,
        score: Math.round(score * 1000) / 1000,
        matchedTokens: matched,
      });
    }

    scored.sort((a, b) => b.score - a.score);

    return { queryTokens, suggestions: scored.slice(0, take) };
  }

  /**
   * Convenience: run suggest() against an existing ContentItem's own
   * title/metadata and, if requested, apply the top suggestion's
   * domainId/objectiveId directly to that row. Still requires the
   * caller to explicitly opt into `apply: true` — never silently
   * auto-assigns.
   */
  async suggestForContentItem(contentItemId: string, take = 5) {
    const item = await this.prisma.contentItem.findUnique({ where: { id: contentItemId } });
    if (!item) {
      throw new NotFoundException(`ContentItem ${contentItemId} not found`);
    }

    const description =
      typeof item.metadata === 'object' && item.metadata !== null
        ? JSON.stringify(item.metadata)
        : undefined;

    return this.suggest(item.title, description, take);
  }

  async applySuggestion(contentItemId: string, objectiveId: string, domainId: string) {
    const [item, objective] = await Promise.all([
      this.prisma.contentItem.findUnique({ where: { id: contentItemId } }),
      this.prisma.learningObjective.findUnique({ where: { id: objectiveId } }),
    ]);
    if (!item) throw new NotFoundException(`ContentItem ${contentItemId} not found`);
    if (!objective) throw new NotFoundException(`LearningObjective ${objectiveId} not found`);

    const updated = await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: { objectiveId, domainId },
    });

    this.logger.log(
      `Applied curriculum mapping: ContentItem ${contentItemId} -> objective ${objectiveId} (domain ${domainId})`,
    );
    return updated;
  }
}
