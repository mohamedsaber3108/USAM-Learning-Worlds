/**
 * Content Provenance Service (audit T-P1-7)
 *
 * Manages ContentLicense + ContentSource records and answers the compliance
 * question that actually matters for shipping a children's product:
 * "is this piece of content legally safe to use, and are we attributing it
 * correctly?".
 *
 * This is the enforcement layer behind English reading passages / imported
 * datasets: every externally-sourced ContentItem should point at a
 * ContentSource, which points at a ContentLicense, so we can prove where
 * content came from and under what terms.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ContentSourceType } from '@prisma/client';

export interface UpsertLicenseDto {
  spdxId: string;
  name: string;
  url?: string;
  commercialUse?: boolean;
  requiresAttribution?: boolean;
  allowsDerivatives?: boolean;
  notes?: string;
}

export interface CreateSourceDto {
  name: string;
  sourceType?: ContentSourceType;
  url?: string;
  attribution?: string;
  author?: string;
  publisher?: string;
  licenseId?: string;
  notes?: string;
}

export interface ComplianceResult {
  compliant: boolean;
  issues: string[];
  attributionText: string | null;
}

@Injectable()
export class ContentProvenanceService {
  constructor(private prisma: PrismaService) {}

  /** Create or update a license by its SPDX identifier. */
  async upsertLicense(dto: UpsertLicenseDto) {
    return this.prisma.contentLicense.upsert({
      where: { spdxId: dto.spdxId },
      create: {
        spdxId: dto.spdxId,
        name: dto.name,
        url: dto.url,
        commercialUse: dto.commercialUse ?? false,
        requiresAttribution: dto.requiresAttribution ?? true,
        allowsDerivatives: dto.allowsDerivatives ?? true,
        notes: dto.notes,
      },
      update: {
        name: dto.name,
        url: dto.url,
        commercialUse: dto.commercialUse ?? false,
        requiresAttribution: dto.requiresAttribution ?? true,
        allowsDerivatives: dto.allowsDerivatives ?? true,
        notes: dto.notes,
      },
    });
  }

  listLicenses() {
    return this.prisma.contentLicense.findMany({ orderBy: { spdxId: 'asc' } });
  }

  async createSource(dto: CreateSourceDto) {
    if (dto.licenseId) {
      const license = await this.prisma.contentLicense.findUnique({
        where: { id: dto.licenseId },
      });
      if (!license) throw new NotFoundException('License not found');
    }
    return this.prisma.contentSource.create({
      data: {
        name: dto.name,
        sourceType: dto.sourceType ?? 'HUMAN_AUTHORED',
        url: dto.url,
        attribution: dto.attribution,
        author: dto.author,
        publisher: dto.publisher,
        licenseId: dto.licenseId,
        notes: dto.notes,
      },
    });
  }

  listSources() {
    return this.prisma.contentSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { license: true },
    });
  }

  /** Attach a content item to a source (records its provenance). */
  async attachSourceToContent(contentItemId: string, sourceId: string) {
    const [content, source] = await Promise.all([
      this.prisma.contentItem.findUnique({ where: { id: contentItemId } }),
      this.prisma.contentSource.findUnique({ where: { id: sourceId } }),
    ]);
    if (!content) throw new NotFoundException('Content item not found');
    if (!source) throw new NotFoundException('Content source not found');

    return this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: { sourceId },
    });
  }

  /**
   * Assess whether a content item is legally safe to ship commercially and
   * whether we have what we need to attribute it. Returns concrete issues so
   * a content reviewer can fix them before publishing.
   *
   * Rules:
   *  - AI-generated / seeded first-party content with no external source is
   *    fine (we own it).
   *  - Externally-sourced content MUST have a license.
   *  - The license MUST permit commercial use (USAM is commercial).
   *  - If the license requires attribution, the source MUST carry an
   *    attribution string.
   */
  async checkCompliance(contentItemId: string): Promise<ComplianceResult> {
    const content = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: { source: { include: { license: true } } },
    });
    if (!content) throw new NotFoundException('Content item not found');

    const issues: string[] = [];

    // First-party content (no external source) is inherently ours to use.
    if (!content.source) {
      if (content.sourceType === 'HUMAN_AUTHORED' || content.sourceType === 'AI_GENERATED') {
        return { compliant: true, issues: [], attributionText: null };
      }
      issues.push('Content has no linked ContentSource; provenance is unknown.');
      return { compliant: false, issues, attributionText: null };
    }

    const { license } = content.source;
    if (!license) {
      issues.push('Content source has no license recorded.');
      return { compliant: false, issues, attributionText: null };
    }

    if (!license.commercialUse) {
      issues.push(
        `License ${license.spdxId} does not permit commercial use, but USAM is a commercial product.`,
      );
    }

    let attributionText: string | null = null;
    if (license.requiresAttribution) {
      attributionText = content.source.attribution ?? null;
      if (!attributionText) {
        issues.push(
          `License ${license.spdxId} requires attribution but the source has no attribution text.`,
        );
      }
    }

    return { compliant: issues.length === 0, issues, attributionText };
  }
}
