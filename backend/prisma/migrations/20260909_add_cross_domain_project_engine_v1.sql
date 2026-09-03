-- agent-backend-cross-domain-project-engine-v1: Cross-Domain/Interdisciplinary
-- Project Engine v1.
--
-- Per USAM_KIDS_ENGINE_GAP_MATRIX.md "Cross-Domain/Interdisciplinary Project
-- Engine" row: the real `Project`/`ProjectMilestone` models (already credited
-- as the Project-Based Learning Engine, Partially implemented) have no
-- domain/subject-tagging field, so there was no way to identify or enforce a
-- project as spanning multiple domains -- every project was domain-agnostic
-- in the schema. This migration adds that missing tagging layer directly on
-- top of the existing real Project model rather than inventing a parallel
-- project system.
--
-- Design:
--  - `domainIds` (TEXT[] of real Domain.id values) lets a project explicitly
--    declare which curriculum domains it draws on. Nullable/empty array is
--    valid (most projects stay single-domain or untagged, matching current
--    real-world usage -- this is additive, not a forced migration of
--    existing rows).
--  - `isCrossDomain` (generated at write-time by the app layer, NOT a DB
--    generated column, because "cross-domain" here means "author explicitly
--    tagged 2+ real curriculum domains", a business rule the app should own
--    and can evolve, not a mechanical array-length check baked into SQL).
--    Stored as a real boolean column, defaulted false, so it can be indexed
--    and queried cheaply.
--
-- Hand-written raw-SQL migration, following this repo's established
-- convention (see e.g. 20260908_add_experimentation_engine_v1.sql) since
-- agents in this project have no live-DB access and must not risk
-- clobbering the tracked-migration history via `prisma migrate dev`.

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "domainIds" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isCrossDomain" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "projects_isCrossDomain_idx" ON "projects"("isCrossDomain");
