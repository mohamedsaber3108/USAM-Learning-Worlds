import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContentItemsService } from './content-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ContentType, ContentStatus, AgeBand, DifficultyLevel } from '@prisma/client';

/**
 * ContentItem authoring endpoints — admin-only, v1 minimal slice.
 *
 * POST  /api/admin/content-items          — author a new ContentItem (DRAFT)
 * GET   /api/admin/content-items          — list/filter existing items
 * GET   /api/admin/content-items/:id      — fetch one
 * PATCH /api/admin/content-items/:id/status — advance status
 *   (DRAFT -> VALIDATING -> VALIDATED -> PUBLISHED, or deprecate/reject)
 *
 * Guarded identically to content-qa.controller.ts: JwtAuthGuard +
 * RolesGuard + @Roles(Role.ADMIN). No learner-facing routes here — this
 * is a CMS-style authoring surface only.
 */
@Controller('admin/content-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContentItemsController {
  constructor(private contentItems: ContentItemsService) {}

  @Post()
  async create(
    @Body()
    body: {
      type: ContentType;
      title: string;
      content: unknown;
      metadata?: unknown;
      language?: string;
      ageBand?: AgeBand;
      domainId?: string;
      objectiveId?: string;
      difficulty?: DifficultyLevel;
    },
    @Req() req: any,
  ) {
    return this.contentItems.create({
      ...body,
      createdBy: req.user?.id ?? req.user?.email,
    });
  }

  @Get()
  async list(
    @Query('type') type?: ContentType,
    @Query('status') status?: ContentStatus,
    @Query('ageBand') ageBand?: AgeBand,
    @Query('domainId') domainId?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.contentItems.list({
      type,
      status,
      ageBand,
      domainId,
      take: take ? parseInt(take, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentItems.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ContentStatus },
    @Req() req: any,
  ) {
    return this.contentItems.updateStatus(id, {
      status: body.status,
      validatedBy: req.user?.id ?? req.user?.email,
    });
  }
}
