-- Computational Thinking Engine: zero-trace engine per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md ("No model, no service, no seed, no
-- frontend reference. Missing."). Built from scratch, matching the exact
-- shape of CareerExplorationConcept/AILiteracyConcept/DigitalLiteracyConcept.
-- NOTE: distinct from the pre-existing, unused CodingConcept model/table —
-- that model is left untouched.
-- Covers the four core computational-thinking pillars for learners aged
-- 8-14 (AgeBand enum: AGE_8_9, AGE_10_11, AGE_12_14): decomposition,
-- pattern-recognition, abstraction, and algorithm-design.

CREATE TABLE "computational_thinking_concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "computational_thinking_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "computational_thinking_concepts_name_key" ON "computational_thinking_concepts"("name");
CREATE UNIQUE INDEX "computational_thinking_concepts_slug_key" ON "computational_thinking_concepts"("slug");
CREATE INDEX "computational_thinking_concepts_slug_idx" ON "computational_thinking_concepts"("slug");
CREATE INDEX "computational_thinking_concepts_category_idx" ON "computational_thinking_concepts"("category");
