-- World Engine / World State Engine: zero-trace engine per
-- USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b ("Mission.worldId is the only
-- trace... a nullable, unindexed, unvalidated free string with no World
-- model, no FK, no relation, no seed data, no controller route, and no
-- frontend reference. Missing."). Built from scratch this pass: a real
-- World model with FK to Domain, and Mission.worldId migrated from a free
-- string to a genuine FK against it.

CREATE TABLE "worlds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "domainId" TEXT NOT NULL,
    "unlockCondition" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worlds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "worlds_name_key" ON "worlds"("name");
CREATE UNIQUE INDEX "worlds_slug_key" ON "worlds"("slug");
CREATE INDEX "worlds_domainId_idx" ON "worlds"("domainId");
CREATE INDEX "worlds_slug_idx" ON "worlds"("slug");

ALTER TABLE "worlds" ADD CONSTRAINT "worlds_domainId_fkey"
    FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate Mission.worldId from free string to real FK. Live data check
-- (pre-migration) showed every existing Mission row has worldId = NULL
-- (9/9 rows), so there is no legacy free-string data to remap — this is a
-- pure type/constraint tightening plus new FK, safe with no data loss.
-- The column stays nullable (a Mission need not belong to a World).
ALTER TABLE "missions" ADD CONSTRAINT "missions_worldId_fkey"
    FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "missions_worldId_idx" ON "missions"("worldId");
