-- agent-backend-content-engines-v3: Media Engine, Simulation Engine,
-- Visual Language Engine. All three confirmed genuinely Missing per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md (zero model/service/controller trace
-- found via grep before this pass). Follows this repo's established
-- convention of hand-written raw-SQL migration files (not
-- `prisma migrate dev`) since agents in this project have no live-DB
-- access and must not risk clobbering the tracked-migration history.

-- ---------- Media Engine ----------
CREATE TYPE "MediaAssetType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'ILLUSTRATION');

CREATE TABLE "media_assets" (
    "id"              TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "slug"            TEXT NOT NULL,
    "type"            "MediaAssetType" NOT NULL,
    "assetUrl"        TEXT NOT NULL,
    "thumbnailUrl"    TEXT,
    "description"     TEXT,
    "domainSlug"      TEXT,
    "ageAppropriate"  "AgeBand" NOT NULL,
    "license"         TEXT NOT NULL DEFAULT 'USAM Original',
    "source"          TEXT NOT NULL DEFAULT 'USAM Original',
    "attribution"     TEXT,
    "durationSeconds" INTEGER,
    "order"           INTEGER NOT NULL DEFAULT 0,
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_assets_slug_key" ON "media_assets"("slug");
CREATE INDEX "media_assets_slug_idx" ON "media_assets"("slug");
CREATE INDEX "media_assets_type_idx" ON "media_assets"("type");
CREATE INDEX "media_assets_ageAppropriate_idx" ON "media_assets"("ageAppropriate");

-- ---------- Simulation Engine ----------
CREATE TYPE "SimulationCategory" AS ENUM ('ENTREPRENEURSHIP', 'FINANCIAL_LITERACY', 'DIGITAL_SAFETY', 'SCIENCE', 'CIVIC');

CREATE TABLE "simulation_scenarios" (
    "id"             TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "slug"           TEXT NOT NULL,
    "category"       "SimulationCategory" NOT NULL,
    "description"    TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "startNodeId"    TEXT,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "order"          INTEGER NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_scenarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "simulation_scenarios_slug_key" ON "simulation_scenarios"("slug");
CREATE INDEX "simulation_scenarios_slug_idx" ON "simulation_scenarios"("slug");
CREATE INDEX "simulation_scenarios_category_idx" ON "simulation_scenarios"("category");

CREATE TABLE "simulation_decision_points" (
    "id"            TEXT NOT NULL,
    "scenarioId"    TEXT NOT NULL,
    "nodeKey"       TEXT NOT NULL,
    "prompt"        TEXT NOT NULL,
    "isEnding"      BOOLEAN NOT NULL DEFAULT false,
    "outcomeNote"   TEXT,
    "choiceOptions" JSONB NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_decision_points_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "simulation_decision_points_scenarioId_nodeKey_key" ON "simulation_decision_points"("scenarioId", "nodeKey");
CREATE INDEX "simulation_decision_points_scenarioId_idx" ON "simulation_decision_points"("scenarioId");

ALTER TABLE "simulation_decision_points" ADD CONSTRAINT "simulation_decision_points_scenarioId_fkey"
    FOREIGN KEY ("scenarioId") REFERENCES "simulation_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- Visual Language Engine ----------
CREATE TYPE "VisualLanguageCategory" AS ENUM ('VOCABULARY', 'EMOTION', 'SEQUENCING', 'COMPREHENSION');

CREATE TABLE "visual_language_cards" (
    "id"             TEXT NOT NULL,
    "word"           TEXT NOT NULL,
    "slug"           TEXT NOT NULL,
    "category"       "VisualLanguageCategory" NOT NULL,
    "imageUrl"       TEXT NOT NULL,
    "caption"        TEXT NOT NULL,
    "ageAppropriate" "AgeBand" NOT NULL,
    "order"          INTEGER NOT NULL DEFAULT 0,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visual_language_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "visual_language_cards_slug_key" ON "visual_language_cards"("slug");
CREATE INDEX "visual_language_cards_slug_idx" ON "visual_language_cards"("slug");
CREATE INDEX "visual_language_cards_category_idx" ON "visual_language_cards"("category");
CREATE INDEX "visual_language_cards_ageAppropriate_idx" ON "visual_language_cards"("ageAppropriate");
