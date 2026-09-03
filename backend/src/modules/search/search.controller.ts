import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  /**
   * GET /api/search?q=...&limit=...
   *
   * Real ranked Postgres full-text search (ts_rank) across missions,
   * activities, and cross-curricular concepts. `q` is length-limited and
   * whitespace-trimmed here (kid-safety: no arbitrarily long input reaches
   * the DB); the actual query text is passed to Prisma's parameterized
   * $queryRaw (tagged template), never string-concatenated into SQL, so
   * there is no SQL-injection surface regardless of what a learner types.
   */
  @Get()
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.searchService.search(q, limit);
  }
}
