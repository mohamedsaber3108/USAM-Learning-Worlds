import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DomainPathService } from './services/domain-path.service';

/**
 * Generic domain learning-path endpoint (canonical spine).
 *
 *   GET /learning/domains/:slug/path
 *
 * One shared projection for every domain (English, Coding, and any future
 * domain that plugs into the spine) — no per-domain path engine. The legacy
 * GET /english/path delegates to the same DomainPathService for back-compat.
 */
@Controller('learning/domains')
@UseGuards(JwtAuthGuard)
export class DomainPathController {
  constructor(private readonly domainPath: DomainPathService) {}

  @Get(':slug/path')
  async getDomainPath(@CurrentUser() user: any, @Param('slug') slug: string) {
    const learnerId = user?.learner?.id ?? null;
    return this.domainPath.getPath(slug, learnerId);
  }
}
