import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  TranslationService,
  CreateTranslationDto,
  SupportedLanguage,
} from './services/translation.service';

/**
 * Translation Controller
 *
 * Thin HTTP surface over the existing TranslationService (real CRUD,
 * en/ar/ar-EG support). Previously the service had zero controller exposing
 * it — this is the localization-wave-1 fix for that gap.
 */
@Controller('translations')
@UseGuards(JwtAuthGuard)
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  /**
   * GET /translations/languages — supported languages + RTL/display info.
   * Registered before the :entityType/:entityId route so it isn't shadowed.
   */
  @Get('languages')
  getSupportedLanguages() {
    const languages = this.translationService.getSupportedLanguages();
    return languages.map((language) => ({
      language,
      displayName: this.translationService.getLanguageDisplayName(language),
      isRTL: this.translationService.isRTL(language),
    }));
  }

  /**
   * GET /translations/qa/stats?entityType=CHARACTER
   * Translation QA Engine (v1): human-approval coverage stats.
   * Registered before the dynamic :entityType/:entityId route below so
   * "qa" is never mistaken for an entityType value.
   */
  @Get('qa/stats')
  async getApprovalStats(@Query('entityType') entityType?: string) {
    return this.translationService.getApprovalStats(entityType);
  }

  /**
   * GET /translations/:entityType/:entityId?language=ar
   * - With `language`: returns { [field]: string | null } resolved for that language.
   * - Without `language`: returns the full TranslatedEntity map (all fields x all languages).
   */
  @Get(':entityType/:entityId')
  async getEntityTranslations(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('language') language?: SupportedLanguage,
  ) {
    const translations = await this.translationService.getEntityTranslations(
      entityType,
      entityId,
    );

    if (!language) {
      return translations;
    }

    const resolved: Record<string, string | null> = {};
    Object.keys(translations).forEach((field) => {
      resolved[field] = translations[field][language] ?? null;
    });
    return resolved;
  }

  /**
   * GET /translations/:entityType/:entityId/:field?language=ar
   * Single field/language lookup — the narrowest read path the service supports.
   */
  @Get(':entityType/:entityId/:field')
  async getTranslation(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('field') field: string,
    @Query('language') language: SupportedLanguage = 'en',
  ) {
    const value = await this.translationService.getTranslation(
      entityType,
      entityId,
      field,
      language,
    );
    return { entityType, entityId, field, language, value };
  }

  /**
   * POST /translations — upsert a single translation.
   * Body matches CreateTranslationDto: { entityType, entityId, field, language, value }
   */
  @Post()
  async upsertTranslation(@Body() dto: CreateTranslationDto) {
    return this.translationService.upsertTranslation(dto);
  }

  /**
   * POST /translations/batch — upsert many translations in one call.
   * Body: CreateTranslationDto[]
   */
  @Post('batch')
  async batchUpsertTranslations(@Body() translations: CreateTranslationDto[]) {
    return this.translationService.batchCreateTranslations(translations);
  }

  /**
   * POST /translations/:entityType/:entityId/:field/approve?language=ar-EG
   * Translation QA Engine (v1): mark/unmark a translation as human-approved.
   * Body: { isHumanApproved: boolean, approvedBy?: string }
   */
  @Post(':entityType/:entityId/:field/approve')
  async setApproval(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('field') field: string,
    @Query('language') language: SupportedLanguage = 'ar-EG',
    @Body() body: { isHumanApproved: boolean; approvedBy?: string },
  ) {
    return this.translationService.setApproval(
      entityType,
      entityId,
      field,
      language,
      body.isHumanApproved,
      body.approvedBy,
    );
  }
}
