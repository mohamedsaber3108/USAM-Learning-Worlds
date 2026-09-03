-- Missing-wave2-cluster-6: Audit Engine + Feature Flag Engine + Bloom Engine
-- (manual-tagging version). See docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
-- for the honesty notes on what is/isn't real here.

-- Audit Engine: real, small AdminAuditLog table. Written to by exactly 3
-- existing sensitive service methods (parents.service.ts setTimeLimits,
-- community.service.ts reviewContent, auth.service.ts updateLearnerAgeBand)
-- via AuditLogService.record() — not a generic request/response logger.
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_actorUserId_idx" ON "admin_audit_logs"("actorUserId");
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- Feature Flag Engine: real, small FeatureFlag table + FeatureFlagService
-- isEnabled(flagKey, learnerId?). ONE real usage: gates
-- streak-freeze.service.ts purchase() behind the `streak_freeze_shop` flag.
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "isEnabledGlobally" BOOLEAN NOT NULL DEFAULT false,
    "learnerOverrides" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");
CREATE INDEX "feature_flags_key_idx" ON "feature_flags"("key");

-- Seed the one real flag used by this pass, enabled by default so the
-- Streak Freeze shop keeps working exactly as before unless an admin
-- flips it off (a real kill-switch demonstration, not a no-op flag).
INSERT INTO "feature_flags" ("id", "key", "description", "isEnabledGlobally", "learnerOverrides", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'streak_freeze_shop',
  'Gates POST /gamification/streak-freeze/purchase. Real demonstration flag for the Feature Flag Engine.',
  true,
  ARRAY[]::TEXT[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Bloom Engine (manual-tagging version): bloomLevel enum + nullable column
-- on activities. AUTO-classification remains Missing (see gap matrix) —
-- this pass manually tags the existing seeded activities below.
CREATE TYPE "BloomLevel" AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');

ALTER TABLE "activities" ADD COLUMN "bloomLevel" "BloomLevel";
CREATE INDEX "activities_bloomLevel_idx" ON "activities"("bloomLevel");

-- Manual tagging of the existing 27 seeded activities (verified via psql
-- read of live titles/types before writing this). Judgment calls noted
-- inline where the mapping isn't obvious from the title alone.
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 5 + 3?';
UPDATE "activities" SET "bloomLevel" = 'CREATE'     WHERE "id" = 'coding-sandbox-demo-activity'; -- writing/producing code, not recalling a fact
UPDATE "activities" SET "bloomLevel" = 'UNDERSTAND' WHERE "title" = 'Place Value Challenge';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 7 + 4?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'Solve: 9 + 6 = ?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 23 + 15?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 45 + 27?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 3 × 4?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 5 × 5?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 4 × 3?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 7 × 8?';
UPDATE "activities" SET "bloomLevel" = 'APPLY'      WHERE "title" = 'What is 9 × 6?';
UPDATE "activities" SET "bloomLevel" = 'REMEMBER'   WHERE "title" = 'Which part of a plant absorbs water?';
UPDATE "activities" SET "bloomLevel" = 'REMEMBER'   WHERE "title" = 'What do leaves do?';
UPDATE "activities" SET "bloomLevel" = 'UNDERSTAND' WHERE "title" = 'Explain photosynthesis';
UPDATE "activities" SET "bloomLevel" = 'ANALYZE'    WHERE "title" = 'Order the plant life cycle'; -- sequencing steps requires breaking the process into ordered parts
UPDATE "activities" SET "bloomLevel" = 'REMEMBER'   WHERE "title" = 'Which planet is closest to the Sun?';
UPDATE "activities" SET "bloomLevel" = 'REMEMBER'   WHERE "title" = 'Which is the largest planet?';
UPDATE "activities" SET "bloomLevel" = 'REMEMBER'   WHERE "title" = 'How many planets are there?';
UPDATE "activities" SET "bloomLevel" = 'UNDERSTAND' WHERE "title" = 'What does "enormous" mean?';
UPDATE "activities" SET "bloomLevel" = 'UNDERSTAND' WHERE "title" = 'What does "ancient" mean?';
UPDATE "activities" SET "bloomLevel" = 'ANALYZE'    WHERE "title" = 'Match the synonyms'; -- comparing/relating word meanings
UPDATE "activities" SET "bloomLevel" = 'UNDERSTAND' WHERE "title" = 'Opposite of "hot"';
UPDATE "activities" SET "bloomLevel" = 'ANALYZE'    WHERE "title" = 'Order the steps to draw a square'; -- decomposing a procedure into ordered steps
UPDATE "activities" SET "bloomLevel" = 'UNDERSTAND' WHERE "title" = 'What is a sequence?';
UPDATE "activities" SET "bloomLevel" = 'REMEMBER'   WHERE "title" = 'What does a loop do?';
UPDATE "activities" SET "bloomLevel" = 'CREATE'     WHERE "title" = 'Write a simple loop';
