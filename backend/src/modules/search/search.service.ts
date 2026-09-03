import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SearchResultItem {
  type: 'mission' | 'activity' | 'concept';
  id: string;
  title: string;
  snippet: string;
  rank: number;
  /**
   * Only populated for type === 'activity'. There is no standalone
   * "activity detail" page/route in the frontend — activities only ever
   * render inside a specific Mission's activity list (MissionDetailPage /
   * MissionPlayerPage). Without this, the frontend had nowhere correct to
   * route an activity search hit and was falling back to the generic
   * `/missions` browse list, silently discarding which mission the
   * clicked activity actually belongs to. Resolved via mission_activities
   * (an Activity can appear in more than one Mission in principle; we pick
   * the lowest `order` row against an isActive mission so the link is
   * deterministic and always resolves to a real, active mission).
   */
  missionId?: string | null;
}

const MAX_QUERY_LENGTH = 100;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Real ranked Postgres full-text search across missions, activities, and
   * cross-curricular concepts, using the generated `searchVector` tsvector
   * columns + GIN indexes from prisma/migrations/20260903_add_search_engine_v1.sql.
   *
   * Kid-safety / injection-safety:
   *  - `q` is trimmed and hard length-limited (MAX_QUERY_LENGTH) before it
   *    ever reaches the DB — no arbitrarily long payloads.
   *  - Too-short queries (< MIN_QUERY_LENGTH) return an empty result set
   *    rather than running an expensive/near-useless full-table scan.
   *  - The query text is passed into Prisma's `$queryRaw` tagged template,
   *    which parameterizes every `${...}` interpolation as a real bound
   *    parameter (via pg's prepared-statement protocol) — it is NEVER
   *    string-concatenated into the SQL string. There is no code path here
   *    where user input becomes part of the SQL text itself.
   *  - `websearch_to_tsquery` (not string-built `to_tsquery`) is used so
   *    arbitrary user punctuation/operators can't produce a malformed or
   *    surprising tsquery — Postgres treats the whole input as plain search
   *    terms, matching how a search box is expected to behave for kids.
   */
  async search(rawQuery: string, rawLimit?: string): Promise<{ query: string; results: SearchResultItem[] }> {
    const q = this.sanitizeQuery(rawQuery);
    const limit = this.sanitizeLimit(rawLimit);

    if (q.length < MIN_QUERY_LENGTH) {
      return { query: q, results: [] };
    }

    try {
      const rows = await this.prisma.$queryRaw<SearchResultItem[]>`
        SELECT * FROM (
          SELECT
            'mission'::text AS type,
            m.id AS id,
            m.title AS title,
            ts_headline(
              'english',
              coalesce(m.description, ''),
              websearch_to_tsquery('english', ${q}),
              'MaxWords=25, MinWords=10, MaxFragments=1'
            ) AS snippet,
            ts_rank(m."searchVector", websearch_to_tsquery('english', ${q})) AS rank,
            NULL::text AS "missionId"
          FROM missions m
          WHERE m."searchVector" @@ websearch_to_tsquery('english', ${q})
            AND m."isActive" = true

          UNION ALL

          SELECT
            'activity'::text AS type,
            a.id AS id,
            a.title AS title,
            ts_headline(
              'english',
              coalesce(a.description, ''),
              websearch_to_tsquery('english', ${q}),
              'MaxWords=25, MinWords=10, MaxFragments=1'
            ) AS snippet,
            ts_rank(a."searchVector", websearch_to_tsquery('english', ${q})) AS rank,
            -- Resolve to the specific Mission this Activity actually lives
            -- under (via mission_activities), preferring the lowest 'order'
            -- row against an isActive mission, so the frontend can route
            -- straight to /missions/:missionId instead of the generic
            -- browse list. NULL here (no active mission links this
            -- activity) is handled client-side as a fallback to /missions.
            (
              SELECT ma."missionId"
              FROM mission_activities ma
              JOIN missions mi ON mi.id = ma."missionId" AND mi."isActive" = true
              WHERE ma."activityId" = a.id
              ORDER BY ma."order" ASC
              LIMIT 1
            ) AS "missionId"
          FROM activities a
          WHERE a."searchVector" @@ websearch_to_tsquery('english', ${q})
            AND a."isActive" = true

          UNION ALL

          SELECT
            'concept'::text AS type,
            c.id AS id,
            c.name AS title,
            ts_headline(
              'english',
              coalesce(c.description, ''),
              websearch_to_tsquery('english', ${q}),
              'MaxWords=25, MinWords=10, MaxFragments=1'
            ) AS snippet,
            ts_rank(c."searchVector", websearch_to_tsquery('english', ${q})) AS rank,
            NULL::text AS "missionId"
          FROM concepts c
          WHERE c."searchVector" @@ websearch_to_tsquery('english', ${q})
            AND c."isActive" = true
        ) combined
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      return {
        query: q,
        results: rows.map((r) => ({
          ...r,
          rank: Number(r.rank),
        })),
      };
    } catch (err) {
      // A malformed tsquery / DB error should never leak internals to the
      // client (kid-facing surface) — log server-side, return empty results.
      this.logger.error(`search failed for query="${q}": ${(err as Error).message}`);
      return { query: q, results: [] };
    }
  }

  private sanitizeQuery(rawQuery: unknown): string {
    if (typeof rawQuery !== 'string') return '';
    const trimmed = rawQuery.trim();
    return trimmed.slice(0, MAX_QUERY_LENGTH);
  }

  private sanitizeLimit(rawLimit?: string): number {
    const parsed = rawLimit ? parseInt(rawLimit, 10) : DEFAULT_LIMIT;
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
    return Math.min(parsed, MAX_LIMIT);
  }
}
