-- Story Engine (small, real, honest scope) — gap matrix cluster-8.
--
-- Adds `stories` + `story_pages`: a Story model (title/ageBand/domainId)
-- and a StoryPage model (pageNumber/text/choiceOptions Json for 2-3-way
-- branching). This deliberately does NOT add a separate branching-engine
-- table — the Story Branching Engine gap is satisfied by the same
-- `choiceOptions` Json column here (see gap matrix note).
--
-- Story Safety Engine fields (`safetyReviewed`/`safetyReviewedAt`/
-- `safetyNotes`) are on StoryPage — every page's text is run through the
-- existing safety lens (Presidio deterministic PII scan, same backstop
-- ModerationService.moderateContent() uses) at seed time even though the
-- content is human-authored, same pattern as AI-generated content review.
--
-- Applied directly via psql on the live DB per this repo's established
-- convention for raw-SQL migrations (see Part 5b of
-- docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md).

CREATE TABLE IF NOT EXISTS "stories" (
  "id"        TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "summary"   TEXT NOT NULL,
  "ageBand"   "AgeBand" NOT NULL,
  "domainId"  TEXT NOT NULL,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "stories_domainId_idx" ON "stories" ("domainId");
CREATE INDEX IF NOT EXISTS "stories_ageBand_idx" ON "stories" ("ageBand");

ALTER TABLE "stories"
  ADD CONSTRAINT "stories_domainId_fkey"
  FOREIGN KEY ("domainId") REFERENCES "domains"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "story_pages" (
  "id"               TEXT NOT NULL,
  "storyId"          TEXT NOT NULL,
  "pageNumber"        INTEGER NOT NULL,
  "text"              TEXT NOT NULL,
  "choiceOptions"     JSONB NOT NULL,
  "safetyReviewed"    BOOLEAN NOT NULL DEFAULT false,
  "safetyReviewedAt"  TIMESTAMP(3),
  "safetyNotes"       TEXT,

  CONSTRAINT "story_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "story_pages_storyId_pageNumber_key" ON "story_pages" ("storyId", "pageNumber");
CREATE INDEX IF NOT EXISTS "story_pages_storyId_idx" ON "story_pages" ("storyId");

ALTER TABLE "story_pages"
  ADD CONSTRAINT "story_pages_storyId_fkey"
  FOREIGN KEY ("storyId") REFERENCES "stories"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
