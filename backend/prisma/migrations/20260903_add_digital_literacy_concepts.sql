-- Digital Literacy Engine: 4th cross-curricular concept model, matching the
-- exact shape of AILiteracyConcept/EntrepreneurshipConcept/FinancialLiteracyConcept.
-- Covers online safety, misinformation, privacy, digital citizenship, ads vs
-- content, password/account safety, and screen-time self-awareness for
-- learners aged 8-14 (AgeBand enum: AGE_8_9, AGE_10_11, AGE_12_14).

CREATE TABLE "digital_literacy_concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_literacy_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "digital_literacy_concepts_name_key" ON "digital_literacy_concepts"("name");
CREATE UNIQUE INDEX "digital_literacy_concepts_slug_key" ON "digital_literacy_concepts"("slug");
CREATE INDEX "digital_literacy_concepts_slug_idx" ON "digital_literacy_concepts"("slug");
CREATE INDEX "digital_literacy_concepts_category_idx" ON "digital_literacy_concepts"("category");
