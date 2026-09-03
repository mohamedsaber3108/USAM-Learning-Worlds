-- agent-backend-ai-tool-permission-v1: AI Prompt/Policy Engine (Safety
-- slice). Per USAM_KIDS_ENGINE_GAP_MATRIX.md "AI Tool Permission Engine"
-- row, no AI service in this repo has any tool-calling capability wired
-- up yet (every AI call is a plain text-completion call to Bedrock), so
-- there is no tool surface to build a permission engine against. This
-- migration instead builds the real, adjacent Missing gap named in the
-- same Safety & Parent Engine bundle: a versioned, auditable
-- SafetyPolicy table that moderation.service.ts and
-- character-safety.service.ts can reference by version instead of
-- hardcoded thresholds/pattern-lists.
--
-- Hand-written raw-SQL migration, following this repo's established
-- convention (see e.g. 20260906_add_media_simulation_visual_language_
-- engines.sql) since agents in this project have no live-DB access and
-- must not risk clobbering the tracked-migration history via
-- `prisma migrate dev`.

CREATE TABLE "safety_policies" (
    "id"            TEXT NOT NULL,
    "ageBand"       "AgeBand" NOT NULL,
    "policyVersion" INTEGER NOT NULL DEFAULT 1,
    "rules"         JSONB NOT NULL,
    "changelog"     TEXT,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_policies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_policies_ageBand_policyVersion_key"
    ON "safety_policies"("ageBand", "policyVersion");

CREATE INDEX "safety_policies_ageBand_isActive_idx"
    ON "safety_policies"("ageBand", "isActive");

CREATE INDEX "safety_policies_effectiveFrom_idx"
    ON "safety_policies"("effectiveFrom");
