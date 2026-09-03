import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ContentType,
  ContentStatus,
  ContentSourceType,
  AgeBand,
  DifficultyLevel,
} from '@prisma/client';

/**
 * ContentItem Authoring Engine — v1.
 *
 * ContentItem (schema.prisma:1184) was a fully orphaned table: the model,
 * ContentType/ContentStatus enums, and indexes existed but zero
 * service/controller anywhere referenced it (see
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md, "Content Ingestion
 * Engine" row). This is deliberately NOT that full ingestion engine (no
 * PDF/OCR, no AI generation pipeline — that's out of scope and much
 * larger). This is the minimal slice that makes the table usable at all:
 * a human content author can create a ContentItem, list/filter existing
 * ones, and move it through the status lifecycle already defined by the
 * ContentStatus enum. Admin-only, same guard pattern as
 * content-qa.controller.ts / admin-missions.controller.ts.
 *
 * Status lifecycle enforced here is the documented happy path:
 *   DRAFT -> VALIDATING -> VALIDATED -> PUBLISHED
 * plus the two terminal/side states already on the enum (DEPRECATED,
 * REJECTED) which are reachable from any non-terminal state — an editor
 * can deprecate or reject content at any point, but cannot "skip forward"
 * past VALIDATING/VALIDATED, and cannot revive a PUBLISHED item back to
 * DRAFT through this endpoint (that would need a new version instead).
 */

const FORWARD_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: [ContentStatus.VALIDATING, ContentStatus.DEPRECATED, ContentStatus.REJECTED],
  VALIDATING: [ContentStatus.VALIDATED, ContentStatus.DRAFT, ContentStatus.REJECTED],
  VALIDATED: [ContentStatus.PUBLISHED, ContentStatus.REJECTED],
  PUBLISHED: [ContentStatus.DEPRECATED],
  DEPRECATED: [],
  REJECTED: [ContentStatus.DRAFT],
};

export interface CreateContentItemInput {
  type: ContentType;
  title: string;
  content: unknown;
  metadata?: unknown;
  language?: string;
  ageBand?: AgeBand;
  domainId?: string;
  objectiveId?: string;
  difficulty?: DifficultyLevel;
  createdBy?: string;
}

export interface ListContentItemsQuery {
  type?: ContentType;
  status?: ContentStatus;
  ageBand?: AgeBand;
  domainId?: string;
  take?: number;
  skip?: number;
}

export interface UpdateStatusInput {
  status: ContentStatus;
  validatedBy?: string;
}

@Injectable()
export class ContentItemsService {
  private readonly logger = new Logger(ContentItemsService.name);

  constructor(private prisma: PrismaService) {}

  async create(input: CreateContentItemInput) {
    if (!input.title?.trim()) {
      throw new BadRequestException('title is required');
    }
    if (input.content === undefined || input.content === null) {
      throw new BadRequestException('content is required');
    }

    const item = await this.prisma.contentItem.create({
      data: {
        type: input.type,
        title: input.title.trim(),
        content: input.content as any,
        metadata: (input.metadata ?? undefined) as any,
        language: input.language ?? 'en',
        ageBand: input.ageBand,
        domainId: input.domainId,
        objectiveId: input.objectiveId,
        difficulty: input.difficulty,
        sourceType: ContentSourceType.HUMAN_AUTHORED,
        createdBy: input.createdBy,
        status: ContentStatus.DRAFT,
      },
    });

    this.logger.log(`Created ContentItem ${item.id} (${item.type}) status=DRAFT`);
    return item;
  }

  async list(query: ListContentItemsQuery) {
    const take = Math.min(Math.max(query.take ?? 25, 1), 100);
    const skip = Math.max(query.skip ?? 0, 0);

    const where = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.ageBand ? { ageBand: query.ageBand } : {}),
      ...(query.domainId ? { domainId: query.domainId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contentItem.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.contentItem.count({ where }),
    ]);

    return { items, total, take, skip };
  }

  async findOne(id: string) {
    const item = await this.prisma.contentItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`ContentItem ${id} not found`);
    }
    return item;
  }

  async updateStatus(id: string, input: UpdateStatusInput) {
    const current = await this.findOne(id);

    const allowed = FORWARD_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw new BadRequestException(
        `Cannot transition ContentItem from ${current.status} to ${input.status}. ` +
          `Allowed next states: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`,
      );
    }

    const data: Record<string, unknown> = { status: input.status };
    if (input.status === ContentStatus.VALIDATED) {
      data.validatedBy = input.validatedBy ?? current.validatedBy;
      data.validatedAt = new Date();
    }

    const updated = await this.prisma.contentItem.update({
      where: { id },
      data,
    });

    this.logger.log(`ContentItem ${id}: ${current.status} -> ${input.status}`);
    return updated;
  }
}
