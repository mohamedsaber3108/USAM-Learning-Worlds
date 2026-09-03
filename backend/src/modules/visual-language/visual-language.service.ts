import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AgeBand, VisualLanguageCategory } from '@prisma/client';

@Injectable()
export class VisualLanguageService {
  constructor(private prisma: PrismaService) {}

  async listCards(ageBand?: AgeBand, category?: VisualLanguageCategory) {
    return this.prisma.visualLanguageCard.findMany({
      where: {
        isActive: true,
        ...(ageBand ? { ageAppropriate: ageBand } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.visualLanguageCard.findUnique({ where: { slug } });
  }
}
