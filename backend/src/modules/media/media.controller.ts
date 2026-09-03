import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgeBand } from '@prisma/client';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  async list(
    @Query('ageBand') ageBand?: AgeBand,
    @Query('domain') domainSlug?: string,
    @Query('type') type?: string,
  ) {
    return this.mediaService.listAssets(ageBand, domainSlug, type);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.mediaService.getBySlug(slug);
  }
}
