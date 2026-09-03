-- Content QA Engine v1: real, small ContentQAFlag model per the Content
-- QA task — general content-quality checks over Activity/Mission rows
-- (completeness, readability-for-age-band, missing-field detection),
-- distinct from the human-authored Rubric system (grading student
-- PROJECT submissions) and the Assessment Quality Engine (auto-review of
-- question ITEMS). See backend/src/modules/content-qa/content-qa.service.ts
-- for the scan logic that writes rows here.

CREATE TABLE "content_qa_flags" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "flagType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "detail" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "content_qa_flags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_qa_flags_entityType_entityId_idx" ON "content_qa_flags"("entityType", "entityId");
CREATE INDEX "content_qa_flags_flagType_idx" ON "content_qa_flags"("flagType");
CREATE INDEX "content_qa_flags_resolvedAt_idx" ON "content_qa_flags"("resolvedAt");
CREATE INDEX "content_qa_flags_severity_idx" ON "content_qa_flags"("severity");
