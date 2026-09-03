-- Problem Solving Engine + Computational Thinking Engine: both zero-trace
-- per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b. Genuinely overlapping content
-- (decomposition/pattern-recognition/abstraction/algorithm-design), so this
-- pass builds ONE ProblemSolvingConcept table covering both rather than two
-- near-duplicate tables. Mirrors AILiteracyConcept/CareerExplorationConcept
-- exactly.

CREATE TABLE "problem_solving_concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_solving_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "problem_solving_concepts_name_key" ON "problem_solving_concepts"("name");
CREATE UNIQUE INDEX "problem_solving_concepts_slug_key" ON "problem_solving_concepts"("slug");
CREATE INDEX "problem_solving_concepts_slug_idx" ON "problem_solving_concepts"("slug");
CREATE INDEX "problem_solving_concepts_category_idx" ON "problem_solving_concepts"("category");
