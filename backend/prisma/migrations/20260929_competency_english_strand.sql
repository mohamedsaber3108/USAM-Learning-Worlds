-- Option A taxonomy (plans-local/69, validated): tag a Competency with its
-- PRIMARY EnglishStrand. Schema-only + idempotent. CEFR is NOT duplicated here —
-- it lives on english_strands (the source of truth); a competency derives CEFR
-- from its strand. Content is seeded separately via a TypeScript upsert seed
-- (prisma/seeds/seed-english-vocabulary-slice.ts), matching the repo's pattern.
--
-- A future CompetencyStrand join (for cross-strand competencies) is additive and
-- does not touch this column.

ALTER TABLE "competencies" ADD COLUMN IF NOT EXISTS "strandId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'competencies_strandId_fkey'
  ) THEN
    ALTER TABLE "competencies"
      ADD CONSTRAINT "competencies_strandId_fkey"
      FOREIGN KEY ("strandId") REFERENCES "english_strands"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "competencies_strandId_idx" ON "competencies"("strandId");
