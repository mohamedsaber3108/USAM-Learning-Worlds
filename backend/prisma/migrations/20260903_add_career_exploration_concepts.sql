-- Career Exploration Engine: zero-trace engine per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b ("No model, no service, no seed,
-- no frontend reference. Missing."). Built from scratch, matching the exact
-- shape of AILiteracyConcept/DigitalLiteracyConcept.
-- Covers career-awareness for learners aged 8-14 (AgeBand enum: AGE_8_9,
-- AGE_10_11, AGE_12_14): what different roles do, and what school subjects
-- help you get there.

CREATE TABLE "career_exploration_concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_exploration_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "career_exploration_concepts_name_key" ON "career_exploration_concepts"("name");
CREATE UNIQUE INDEX "career_exploration_concepts_slug_key" ON "career_exploration_concepts"("slug");
CREATE INDEX "career_exploration_concepts_slug_idx" ON "career_exploration_concepts"("slug");
CREATE INDEX "career_exploration_concepts_category_idx" ON "career_exploration_concepts"("category");
