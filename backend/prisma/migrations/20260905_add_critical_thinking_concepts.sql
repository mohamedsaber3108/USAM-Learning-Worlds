-- Critical Thinking Engine: zero-trace engine per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b ("No model, no service, no seed,
-- no frontend reference. Missing."). Built from scratch, matching the
-- exact shape of AILiteracyConcept/CareerExplorationConcept/
-- DigitalLiteracyConcept/ComputationalThinkingConcept.
-- Covers core critical-thinking skills for learners aged 8-14 (AgeBand
-- enum: AGE_8_9, AGE_10_11, AGE_12_14): spotting bias, evaluating
-- evidence, distinguishing fact from opinion, recognizing common logical
-- fallacies for kids, questioning sources, and cause vs. correlation.

CREATE TABLE "critical_thinking_concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_thinking_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "critical_thinking_concepts_name_key" ON "critical_thinking_concepts"("name");
CREATE UNIQUE INDEX "critical_thinking_concepts_slug_key" ON "critical_thinking_concepts"("slug");
CREATE INDEX "critical_thinking_concepts_slug_idx" ON "critical_thinking_concepts"("slug");
CREATE INDEX "critical_thinking_concepts_category_idx" ON "critical_thinking_concepts"("category");
