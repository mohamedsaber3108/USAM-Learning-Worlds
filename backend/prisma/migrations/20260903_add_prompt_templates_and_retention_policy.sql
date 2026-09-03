-- AI Prompt/Policy Engine (missing-wave2-cluster-5): versioned,
-- centrally-managed system-prompt store replacing hardcoded string
-- literals in character.service.ts / moderation.service.ts /
-- coding-coach.service.ts / english-coach.service.ts.
CREATE TABLE IF NOT EXISTS "prompt_templates" (
    "id"        TEXT NOT NULL,
    "key"       TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "version"   INTEGER NOT NULL DEFAULT 1,
    "changelog" TEXT,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "prompt_templates_key_key" ON "prompt_templates"("key");
CREATE INDEX IF NOT EXISTS "prompt_templates_key_idx" ON "prompt_templates"("key");

-- AI Memory Governance (missing-wave2-cluster-5): retention-policy
-- fields on the two tables that persist raw learner/AI data
-- indefinitely today.
ALTER TABLE "learner_contexts" ADD COLUMN IF NOT EXISTS "retentionDays" INTEGER NOT NULL DEFAULT 90;
ALTER TABLE "conversation_messages" ADD COLUMN IF NOT EXISTS "retentionDays" INTEGER NOT NULL DEFAULT 180;
