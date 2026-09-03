-- USAM Search Engine v1 — Postgres full-text search infra for Missions + Activities
-- Coordinator: review before applying to prod. NOT applied by this agent.
--
-- Adds a generated tsvector column ("searchVector") to missions and activities,
-- built from their real columns (title/description), plus a GIN index on each.
-- Using STORED generated columns (Postgres 12+) so the vector is maintained
-- automatically by Postgres on INSERT/UPDATE — no app-side triggers needed.

-- ==================== missions ====================
ALTER TABLE "missions"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce("title", '') || ' ' || coalesce("description", '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "missions_search_vector_idx"
  ON "missions" USING GIN ("searchVector");

-- ==================== activities ====================
-- Activity.description is nullable; Activity.content is Json (question/answer
-- payload) — intentionally NOT indexed here in v1 (arbitrary nested JSON,
-- no stable text shape across ActivityType). title/description only.
ALTER TABLE "activities"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce("title", '') || ' ' || coalesce("description", '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "activities_search_vector_idx"
  ON "activities" USING GIN ("searchVector");

-- ==================== concepts (cross-curricular concept content) ====================
-- Concept.name + Concept.description cover the cross-curricular concept
-- graph (Concept -> Competency -> Domain), the third "spans" surface named
-- in the task alongside Missions/Activities.
ALTER TABLE "concepts"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce("name", '') || ' ' || coalesce("description", '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "concepts_search_vector_idx"
  ON "concepts" USING GIN ("searchVector");
