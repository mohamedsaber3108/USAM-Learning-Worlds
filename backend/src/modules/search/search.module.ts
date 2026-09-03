import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Search Engine v1 — real Postgres full-text search across Missions,
 * Activities, and cross-curricular Concepts, replacing the previous "zero
 * real search infra" state (the only prior "search" in the codebase was a
 * plain `contains` filter in community.controller.ts, scoped to community
 * projects only, not curriculum content).
 *
 * Backed by generated tsvector columns + GIN indexes added via the raw SQL
 * migration prisma/migrations/20260903_add_search_engine_v1.sql (missions,
 * activities, concepts tables) — NOT auto-applied by Prisma migrate, this
 * module assumes that SQL has been reviewed and applied to the target DB.
 */
@Module({
  imports: [AuthModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
