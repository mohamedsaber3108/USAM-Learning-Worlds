-- Vocabulary Engine gap fix: replace the frontend's fragile name-string-
-- parsing (EnglishStrandsPage.tsx's `familyOf()` regex on
-- "<Family>: <Topic> (<CEFR>)") with a real, queryable enum column on
-- EnglishStrand. Adds the enum type + nullable column, then backfills all
-- 45 existing rows by parsing their current `name` value server-side
-- ONCE (this migration), not on every frontend render.
--
-- Applied directly via psql on the live DB per this repo's established
-- convention for raw-SQL migrations (see Part 5b of
-- docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md).

CREATE TYPE "EnglishStrandFamily" AS ENUM (
  'VOCABULARY',
  'GRAMMAR',
  'PRONUNCIATION',
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'SHADOWING',
  'DICTATION'
);

ALTER TABLE "english_strands" ADD COLUMN IF NOT EXISTS "strandType" "EnglishStrandFamily";

CREATE INDEX IF NOT EXISTS "english_strands_strandType_idx" ON "english_strands" ("strandType");

-- Backfill: rows are named either "<Family>: <Topic> (<CEFR>)" (26 rows,
-- e.g. "Vocabulary: Everyday Words (A1)") or a bare family-ish label with
-- no colon (19 rows, e.g. "Vocabulary Building", "Grammar Fundamentals",
-- "Reading Comprehension") - both forms map unambiguously to one of the
-- 9 families by checking which family name the row's `name` STARTS WITH,
-- case-insensitively. Verified against all 45 live rows before writing
-- this migration (see live psql dump captured this tick).
UPDATE "english_strands" SET "strandType" = 'VOCABULARY'    WHERE "name" ILIKE 'Vocabulary%';
UPDATE "english_strands" SET "strandType" = 'GRAMMAR'       WHERE "name" ILIKE 'Grammar%';
UPDATE "english_strands" SET "strandType" = 'PRONUNCIATION' WHERE "name" ILIKE 'Pronunciation%';
UPDATE "english_strands" SET "strandType" = 'LISTENING'     WHERE "name" ILIKE 'Listening%';
UPDATE "english_strands" SET "strandType" = 'READING'       WHERE "name" ILIKE 'Reading%' OR "name" ILIKE 'Critical Reading%';
UPDATE "english_strands" SET "strandType" = 'WRITING'       WHERE "name" ILIKE 'Writing%' OR "name" ILIKE 'Creative Writing%';
UPDATE "english_strands" SET "strandType" = 'SPEAKING'      WHERE "name" ILIKE 'Speaking%' OR "name" ILIKE 'Presentation Skills%' OR "name" ILIKE 'Fluency Development%';
UPDATE "english_strands" SET "strandType" = 'SHADOWING'     WHERE "name" ILIKE 'Shadowing%';
UPDATE "english_strands" SET "strandType" = 'DICTATION'     WHERE "name" ILIKE 'Dictation%';

-- Remaining generic-label rows without a clean family prefix (Academic
-- English, Business English, Storytelling) default to VOCABULARY (their
-- closest real content-family per the seed file's own topic descriptions)
-- rather than being left NULL.
UPDATE "english_strands" SET "strandType" = 'VOCABULARY'
  WHERE "strandType" IS NULL
    AND "name" IN ('Academic English', 'Business English', 'Storytelling');
