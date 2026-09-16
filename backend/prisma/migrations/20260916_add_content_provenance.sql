-- Audit T-P1-7: content provenance — first-class source + license tracking.
-- Idempotent per this project's manual psql apply convention.

CREATE TABLE IF NOT EXISTS "content_licenses" (
  "id"                  TEXT PRIMARY KEY,
  "spdxId"              TEXT NOT NULL UNIQUE,
  "name"                TEXT NOT NULL,
  "url"                 TEXT,
  "commercialUse"       BOOLEAN NOT NULL DEFAULT false,
  "requiresAttribution" BOOLEAN NOT NULL DEFAULT true,
  "allowsDerivatives"   BOOLEAN NOT NULL DEFAULT true,
  "notes"               TEXT,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "content_sources" (
  "id"          TEXT PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "sourceType"  TEXT NOT NULL DEFAULT 'HUMAN_AUTHORED',
  "url"         TEXT,
  "attribution" TEXT,
  "author"      TEXT,
  "publisher"   TEXT,
  "licenseId"   TEXT,
  "notes"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_sources_licenseId_fkey"
    FOREIGN KEY ("licenseId") REFERENCES "content_licenses"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "content_sources_licenseId_idx" ON "content_sources"("licenseId");
CREATE INDEX IF NOT EXISTS "content_sources_sourceType_idx" ON "content_sources"("sourceType");

-- Link ContentItem -> ContentSource.
ALTER TABLE "content_items" ADD COLUMN IF NOT EXISTS "sourceId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_items_sourceId_fkey'
  ) THEN
    ALTER TABLE "content_items"
      ADD CONSTRAINT "content_items_sourceId_fkey"
      FOREIGN KEY ("sourceId") REFERENCES "content_sources"("id") ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "content_items_sourceId_idx" ON "content_items"("sourceId");
