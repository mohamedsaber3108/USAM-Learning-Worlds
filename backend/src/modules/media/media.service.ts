import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AgeBand } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async listAssets(ageBand?: AgeBand, domainSlug?: string, type?: string) {
    return this.prisma.mediaAsset.findMany({
      where: {
        isActive: true,
        ...(ageBand ? { ageAppropriate: ageBand } : {}),
        ...(domainSlug ? { domainSlug } : {}),
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.mediaAsset.findUnique({ where: { slug } });
  }
}
