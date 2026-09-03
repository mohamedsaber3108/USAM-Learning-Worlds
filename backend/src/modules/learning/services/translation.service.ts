/**
 * Translation Service
 *
 * Manages multilingual content for Arabic, Egyptian Arabic, and English
 * CRITICAL: Arabic/Egyptian Arabic is MANDATORY requirement
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export type SupportedLanguage = 'en' | 'ar' | 'ar-EG';

export interface CreateTranslationDto {
  entityType: string;
  entityId: string;
  field: string;
  language: SupportedLanguage;
  value: string;
  // Translation QA Engine (v1): set true ONLY when the caller is a human
  // deliberately writing/reviewing this exact value (e.g. hand-written
  // Egyptian Arabic content, not a machine-translation or LLM output).
  // approvedBy should identify who approved it (name/email/"seed-script").
  isHumanApproved?: boolean;
  approvedBy?: string;
}

export interface TranslatedEntity {
  [field: string]: {
    en?: string;
    ar?: string;
    'ar-EG'?: string;
  };
}

@Injectable()
export class TranslationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or update translation
   */
  async upsertTranslation(dto: CreateTranslationDto) {
    const isHumanApproved = dto.isHumanApproved ?? false;
    const approvedBy = isHumanApproved ? dto.approvedBy ?? null : null;
    const approvedAt = isHumanApproved ? new Date() : null;

    return this.prisma.translation.upsert({
      where: {
        entityType_entityId_field_language: {
          entityType: dto.entityType,
          entityId: dto.entityId,
          field: dto.field,
          language: dto.language,
        },
      },
      create: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        field: dto.field,
        language: dto.language,
        value: dto.value,
        isHumanApproved,
        approvedBy,
        approvedAt,
      },
      update: {
        value: dto.value,
        isHumanApproved,
        approvedBy,
        approvedAt,
      },
    });
  }

  /**
   * Translation QA Engine (v1): mark an existing translation row as
   * human-approved (or revoke approval) without touching its value.
   * This is the "controlled, not AI-hallucinated" gate the gap matrix
   * calls for, applied directly to the existing Translation table.
   */
  async setApproval(
    entityType: string,
    entityId: string,
    field: string,
    language: SupportedLanguage,
    isHumanApproved: boolean,
    approvedBy?: string,
  ) {
    const existing = await this.prisma.translation.findUnique({
      where: {
        entityType_entityId_field_language: { entityType, entityId, field, language },
      },
    });

    if (!existing) {
      throw new NotFoundException('Translation not found');
    }

    return this.prisma.translation.update({
      where: { id: existing.id },
      data: {
        isHumanApproved,
        approvedBy: isHumanApproved ? approvedBy ?? null : null,
        approvedAt: isHumanApproved ? new Date() : null,
      },
    });
  }

  /**
   * Translation QA Engine (v1): coverage stats split by approval status,
   * so it's possible to see how much Arabic content is real
   * human-approved curriculum vs. still-placeholder/unapproved.
   */
  async getApprovalStats(entityType?: string) {
    const where = entityType ? { entityType } : {};
    const [total, approved] = await Promise.all([
      this.prisma.translation.count({ where }),
      this.prisma.translation.count({ where: { ...where, isHumanApproved: true } }),
    ]);

    return {
      entityType: entityType ?? 'ALL',
      total,
      approved,
      unapproved: total - approved,
      approvalPercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }

  /**
   * Get translation for specific entity, field, and language
   */
  async getTranslation(
    entityType: string,
    entityId: string,
    field: string,
    language: SupportedLanguage,
  ): Promise<string | null> {
    const translation = await this.prisma.translation.findUnique({
      where: {
        entityType_entityId_field_language: {
          entityType,
          entityId,
          field,
          language,
        },
      },
    });

    return translation?.value || null;
  }

  /**
   * Get all translations for an entity
   */
  async getEntityTranslations(
    entityType: string,
    entityId: string,
  ): Promise<TranslatedEntity> {
    const translations = await this.prisma.translation.findMany({
      where: {
        entityType,
        entityId,
      },
    });

    const result: TranslatedEntity = {};

    translations.forEach((t) => {
      if (!result[t.field]) {
        result[t.field] = {};
      }
      result[t.field][t.language as SupportedLanguage] = t.value;
    });

    return result;
  }

  /**
   * Get translated entity (base entity + translations)
   */
  async getTranslatedEntity(
    entityType: string,
    entityId: string,
    language: SupportedLanguage,
    baseEntity: any,
  ) {
    const translations = await this.getEntityTranslations(entityType, entityId);

    const result = { ...baseEntity };

    // Apply translations for requested language
    Object.keys(translations).forEach((field) => {
      if (translations[field][language]) {
        result[field] = translations[field][language];
      }
    });

    return result;
  }

  /**
   * Batch create translations
   */
  async batchCreateTranslations(translations: CreateTranslationDto[]) {
    const results = [];

    for (const dto of translations) {
      const result = await this.upsertTranslation(dto);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete translation
   */
  async deleteTranslation(
    entityType: string,
    entityId: string,
    field: string,
    language: SupportedLanguage,
  ) {
    const existing = await this.prisma.translation.findUnique({
      where: {
        entityType_entityId_field_language: {
          entityType,
          entityId,
          field,
          language,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.translation.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }

  /**
   * Delete all translations for entity
   */
  async deleteEntityTranslations(entityType: string, entityId: string) {
    const result = await this.prisma.translation.deleteMany({
      where: {
        entityType,
        entityId,
      },
    });

    return { deleted: result.count };
  }

  /**
   * Get translation coverage statistics
   */
  async getTranslationCoverage(entityType: string) {
    const entities = await this.getEntityCount(entityType);

    const translationsByLanguage = await this.prisma.translation.groupBy({
      by: ['language', 'entityId'],
      where: { entityType },
      _count: true,
    });

    const coverage = {
      entityType,
      totalEntities: entities,
      en: new Set<string>(),
      ar: new Set<string>(),
      'ar-EG': new Set<string>(),
    };

    translationsByLanguage.forEach((t) => {
      coverage[t.language as SupportedLanguage].add(t.entityId);
    });

    return {
      entityType,
      totalEntities: entities,
      coverage: {
        en: {
          count: coverage.en.size,
          percentage: entities > 0 ? Math.round((coverage.en.size / entities) * 100) : 0,
        },
        ar: {
          count: coverage.ar.size,
          percentage: entities > 0 ? Math.round((coverage.ar.size / entities) * 100) : 0,
        },
        'ar-EG': {
          count: coverage['ar-EG'].size,
          percentage: entities > 0 ? Math.round((coverage['ar-EG'].size / entities) * 100) : 0,
        },
      },
    };
  }

  /**
   * Auto-translate using placeholder (for development)
   * In production, replace with real translation service
   */
  async autoTranslate(
    entityType: string,
    entityId: string,
    field: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[],
  ) {
    const sourceTranslation = await this.getTranslation(
      entityType,
      entityId,
      field,
      sourceLanguage,
    );

    if (!sourceTranslation) {
      throw new NotFoundException('Source translation not found');
    }

    const results = [];

    for (const targetLang of targetLanguages) {
      // BACKLOG (tracked in docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
      // under Translation QA Engine / Localization CMS): wire a real
      // translation provider here (candidates: DeepL API, Google Cloud
      // Translation, or LibreTranslate self-hosted). Deliberately NOT
      // auto-implemented because it requires a funded API key decision
      // (cost/quality tradeoff) - a product call, not a code call. Until
      // then, output is explicitly marked untranslated so it's never
      // silently served to a learner as if it were real content.
      const translatedValue = `[NEEDS_TRANSLATION:${targetLang.toUpperCase()}] ${sourceTranslation}`;

      const result = await this.upsertTranslation({
        entityType,
        entityId,
        field,
        language: targetLang,
        value: translatedValue,
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Get entity count by type
   */
  private async getEntityCount(entityType: string): Promise<number> {
    switch (entityType) {
      case 'DOMAIN':
        return this.prisma.domain.count({ where: { isActive: true } });
      case 'SKILL':
        return this.prisma.skill.count({ where: { isActive: true } });
      case 'COMPETENCY':
        return this.prisma.competency.count({ where: { isActive: true } });
      case 'CONCEPT':
        return this.prisma.concept.count({ where: { isActive: true } });
      case 'OBJECTIVE':
        return this.prisma.learningObjective.count({ where: { isActive: true } });
      case 'ACTIVITY':
        return this.prisma.activity.count({ where: { isActive: true } });
      case 'MISSION':
        return this.prisma.mission.count({ where: { isActive: true } });
      case 'CHARACTER':
        return this.prisma.character.count({ where: { isActive: true } });
      default:
        return 0;
    }
  }

  /**
   * Detect language (simple heuristic)
   */
  detectLanguage(text: string): SupportedLanguage {
    // Check for Arabic characters
    const arabicPattern = /[؀-ۿ]/;
    if (arabicPattern.test(text)) {
      // Check for Egyptian Arabic markers (simplified)
      const egyptianMarkers = ['علشان', 'ازاي', 'ايه', 'مش', 'كده'];
      const hasEgyptianMarkers = egyptianMarkers.some((marker) => text.includes(marker));
      return hasEgyptianMarkers ? 'ar-EG' : 'ar';
    }

    return 'en';
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return ['en', 'ar', 'ar-EG'];
  }

  /**
   * Get language display name
   */
  getLanguageDisplayName(language: SupportedLanguage): string {
    const names = {
      en: 'English',
      ar: 'العربية (Modern Standard Arabic)',
      'ar-EG': 'العامية المصرية (Egyptian Arabic)',
    };

    return names[language];
  }

  /**
   * Check if language is RTL
   */
  isRTL(language: SupportedLanguage): boolean {
    return language === 'ar' || language === 'ar-EG';
  }
}
