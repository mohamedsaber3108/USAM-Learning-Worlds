/**
 * AI Prompt/Policy Engine (generic prompt-template slice) — admin
 * viewer + editor endpoint.
 *
 * Closes the second half of the "AI Prompt/Policy Engine" gap (see
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md — "generic prompt
 * templates sub-gap", flagged Missing since Tick 43/pre-Tick-43).
 * `PromptTemplateService.getPrompt()`/`upsertTemplate()` already give
 * every caller (character.service.ts, moderation.service.ts,
 * coding-coach.service.ts, english-coach.service.ts) a versioned,
 * changelog-tracked DB-backed prompt with inline-fallback safety —
 * what was missing was any admin-facing surface to actually view or
 * change those rows without a raw psql/ts-node script. This controller
 * is that surface: list all templates (with version/changelog/active
 * state), fetch one by key, and edit one (which calls the existing
 * `upsertTemplate` — bumps version, appends changelog, never deletes
 * history), plus a soft-disable toggle. Guarded by the real ADMIN
 * role via JwtAuthGuard + RolesGuard, same pattern as
 * AdminSafetyPolicyController / AdminAIEvalController.
 */
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PromptTemplateService } from './services/prompt-template.service';
import { PrismaService } from '../../database/prisma.service';

@Controller('admin/prompt-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPromptTemplateController {
  constructor(
    private promptTemplates: PromptTemplateService,
    private prisma: PrismaService,
  ) {}

  /**
   * List every versioned prompt template currently in the table —
   * moderation.system, character.guidelines, coding-coach.debug,
   * english-coach.conversation, and any future key added by seed
   * scripts or this controller's own PUT below.
   */
  @Get()
  async listTemplates() {
    return this.promptTemplates.listTemplates();
  }

  /**
   * Drill into one key's current row (content/version/changelog/
   * isActive). 404 if the key was never seeded — the caller-side
   * inline fallback is still what's actually in effect for it.
   */
  @Get(':key')
  async getTemplate(@Param('key') key: string) {
    const row = await this.prisma.promptTemplate.findUnique({ where: { key } });
    if (!row) {
      throw new NotFoundException(
        `No PromptTemplate row for key="${key}" — the owning service is using its inline fallback.`,
      );
    }
    return row;
  }

  /**
   * Edit a template's content. Delegates to the existing
   * `upsertTemplate` (bumps version, appends changelog, preserves
   * history — never destructive). `changelog` is required so every
   * edit is self-documenting in the audit trail, same discipline as
   * SafetyPolicyService.createPolicyVersion().
   */
  @Put(':key')
  async updateTemplate(
    @Param('key') key: string,
    @Body() body: { content: string; changelog: string },
  ) {
    if (!body?.content || !body?.changelog) {
      throw new NotFoundException('Both "content" and "changelog" are required.');
    }
    return this.promptTemplates.upsertTemplate(key, body.content, body.changelog);
  }

  /**
   * Soft-disable a template without deleting it — the owning service
   * falls back to its inline default on the next call (getPrompt()
   * already checks `isActive`). Reversible by PUT-ing new content
   * (upsertTemplate always sets isActive: true on write) or a future
   * dedicated re-enable route if that's ever needed separately.
   */
  @Patch(':key/deactivate')
  async deactivateTemplate(@Param('key') key: string) {
    const existing = await this.prisma.promptTemplate.findUnique({ where: { key } });
    if (!existing) {
      throw new NotFoundException(`No PromptTemplate row for key="${key}".`);
    }
    return this.prisma.promptTemplate.update({
      where: { key },
      data: { isActive: false },
    });
  }
}
