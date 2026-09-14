-- Audit T-P2-2: pgvector semantic retrieval for RAG grounding.
-- Adds a 384-dim embedding column to `concepts` (matches all-MiniLM-L6-v2
-- output dim) plus an approximate-nearest-neighbour index for cosine search.
--
-- The `vector` type is NOT a native Prisma type, so this column is managed
-- purely via raw SQL + $queryRaw (LearnerContextService.semanticRetrieve).
-- Keeping it out of schema.prisma avoids Prisma trying to drop/alter it.
--
-- Idempotent (extension IF NOT EXISTS, column IF NOT EXISTS, index IF NOT
-- EXISTS) so re-running against an already-migrated DB is safe — matches the
-- project's manual psql apply convention (scripts/check-migrations-applied.ts).
--
-- Embeddings are backfilled lazily/asynchronously by EmbeddingService, so the
-- column is nullable: rows without an embedding simply fall through to the
-- existing full-text retrieval path (graceful degradation, never a hard dep).

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "concepts" ADD COLUMN IF NOT EXISTS "embedding" vector(384);

-- IVFFlat cosine index for approximate nearest-neighbour search. `lists` is
-- deliberately small (curriculum concept count is in the hundreds/low
-- thousands); tune upward if the concept corpus grows substantially.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'concepts_embedding_cosine_idx'
  ) THEN
    CREATE INDEX concepts_embedding_cosine_idx
      ON "concepts" USING ivfflat ("embedding" vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END$$;
