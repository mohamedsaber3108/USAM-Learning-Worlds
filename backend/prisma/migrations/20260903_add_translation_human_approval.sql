-- Translation QA Engine (v1) + Arabic Educational Content Engine approval gate.
-- Adds a human-approval gate directly on the existing Translation table per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md: nothing enforced "controlled, not
-- AI-hallucinated" Arabic content before this. isHumanApproved is only ever
-- set true by a human deliberately writing/reviewing the value (see
-- seed-arabic-human-approved.ts) - TranslationService.autoTranslate's
-- placeholder path never sets it.

ALTER TABLE "translations"
  ADD COLUMN "isHumanApproved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "approvedBy" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3);

CREATE INDEX "translations_isHumanApproved_idx" ON "translations"("isHumanApproved");
