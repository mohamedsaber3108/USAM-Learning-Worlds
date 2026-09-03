/**
 * Prompt Template Service
 *
 * AI Prompt/Policy Engine (small, real version). Backs the
 * `PromptTemplate` table: versioned, changelog-tracked system prompts
 * that replace the previously-hardcoded string literals in
 * character.service.ts / moderation.service.ts / coding-coach.service.ts
 * / english-coach.service.ts. See docs/architecture/
 * USAM_KIDS_ENGINE_GAP_MATRIX.md "AI Prompt/Policy Engine" row.
 *
 * Design: each caller still ships an inline DEFAULT string (so the
 * service degrades gracefully if the DB row is ever missing/inactive -
 * a child-facing AI call must never hard-fail because of a prompt-table
 * outage). `getPrompt(key, fallback)` reads the active DB template if
 * present, otherwise returns the caller's fallback. This is a real
 * migration off inline strings (services now call this instead of
 * embedding the text directly), not just a parallel unused table.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface PromptTemplateRecord {
  key: string;
  content: string;
  version: number;
  changelog: string | null;
  isActive: boolean;
}

@Injectable()
export class PromptTemplateService {
  private readonly logger = new Logger(PromptTemplateService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Fetch the active prompt content for `key`, falling back to
   * `fallback` if no active row exists (missing key, row deactivated,
   * or a DB error - moderation/coaching must stay available).
   */
  async getPrompt(key: string, fallback: string): Promise<string> {
    try {
      const row = await this.prisma.promptTemplate.findUnique({ where: { key } });
      if (row && row.isActive) {
        return row.content;
      }
    } catch (error: any) {
      this.logger.warn(`PromptTemplate lookup failed for key="${key}", using inline fallback: ${error?.message}`);
    }
    return fallback;
  }

  /**
   * Upsert a template: if it exists, bump the version and record the
   * changelog entry; if not, create it at version 1. Used by the seed
   * script and by any future admin tooling.
   */
  async upsertTemplate(key: string, content: string, changelog: string): Promise<PromptTemplateRecord> {
    const existing = await this.prisma.promptTemplate.findUnique({ where: { key } });

    if (!existing) {
      const created = await this.prisma.promptTemplate.create({
        data: { key, content, version: 1, changelog, isActive: true },
      });
      return created;
    }

    const updated = await this.prisma.promptTemplate.update({
      where: { key },
      data: {
        content,
        version: existing.version + 1,
        changelog,
      },
    });
    return updated;
  }

  async listTemplates(): Promise<PromptTemplateRecord[]> {
    return this.prisma.promptTemplate.findMany({ orderBy: { key: 'asc' } });
  }
}
