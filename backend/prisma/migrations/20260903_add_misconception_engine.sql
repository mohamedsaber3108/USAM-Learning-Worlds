-- Misconception Engine v1
-- Tracks recurring WRONG-answer patterns per QuestionTemplate/Activity so
-- admins can see *what* kids actually get wrong, not just pass/fail rates.
-- Seeded with real, pedagogically-documented common-wrong-answer
-- signatures (fraction addition, order of operations, decimal
-- place-value, etc. — see misconception-seed-data.ts) plus an
-- auto-detection path: any wrong answer not matching a known signature is
-- logged unlabeled (description = NULL) and re-checked on every
-- subsequent occurrence; at 3+ occurrences it is treated as a confirmed
-- (but still unlabeled, pending human review) recurring pattern.

CREATE TABLE "misconception_patterns" (
    "id" TEXT NOT NULL,
    "questionTemplateId" TEXT,
    "activityId" TEXT,
    "wrongAnswerValue" TEXT NOT NULL,
    "frequencyCount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "isLabeled" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "misconception_patterns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "misconception_patterns_questionTemplateId_activityId_wron_key"
  ON "misconception_patterns"("questionTemplateId", "activityId", "wrongAnswerValue");

CREATE INDEX "misconception_patterns_questionTemplateId_idx" ON "misconception_patterns"("questionTemplateId");
CREATE INDEX "misconception_patterns_activityId_idx" ON "misconception_patterns"("activityId");
CREATE INDEX "misconception_patterns_frequencyCount_idx" ON "misconception_patterns"("frequencyCount");

ALTER TABLE "misconception_patterns" ADD CONSTRAINT "misconception_patterns_questionTemplateId_fkey"
  FOREIGN KEY ("questionTemplateId") REFERENCES "question_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "misconception_patterns" ADD CONSTRAINT "misconception_patterns_activityId_fkey"
  FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
