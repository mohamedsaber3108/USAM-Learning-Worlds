import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { VisualLanguageService } from './visual-language.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgeBand, VisualLanguageCategory } from '@prisma/client';

@Controller('visual-language')
@UseGuards(JwtAuthGuard)
export class VisualLanguageController {
  constructor(private visualLanguageService: VisualLanguageService) {}

  @Get()
  async list(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('category') category?: VisualLanguageCategory,
  ) {
    return this.visualLanguageService.listCards(ageBand, category);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.visualLanguageService.getBySlug(slug);
  }
}
