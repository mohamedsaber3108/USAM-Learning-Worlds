-- Audit T-P1-6: evidence -> competency mastery -> verifiable credential.
-- Open Badges 3.0 / W3C Verifiable Credential style credentialing.
-- Idempotent (IF NOT EXISTS) per this project's manual psql apply convention
-- (scripts/check-migrations-applied.ts).

CREATE TABLE IF NOT EXISTS "credential_definitions" (
  "id"            TEXT PRIMARY KEY,
  "competencyId"  TEXT NOT NULL UNIQUE,
  "name"          TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "criteria"      TEXT NOT NULL,
  "imageUrl"      TEXT,
  "minConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
  "minEvidence"   INTEGER NOT NULL DEFAULT 3,
  "isActive"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credential_definitions_competencyId_fkey"
    FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "credentials" (
  "id"            TEXT PRIMARY KEY,
  "learnerId"     TEXT NOT NULL,
  "definitionId"  TEXT NOT NULL,
  "confidence"    DOUBLE PRECISION NOT NULL,
  "evidenceCount" INTEGER NOT NULL,
  "assertionJson" JSONB NOT NULL,
  "credentialUid" TEXT NOT NULL UNIQUE,
  "proofJws"      TEXT,
  "revokedAt"     TIMESTAMP(3),
  "revokedReason" TEXT,
  "issuedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credentials_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE,
  CONSTRAINT "credentials_definitionId_fkey"
    FOREIGN KEY ("definitionId") REFERENCES "credential_definitions"("id") ON DELETE CASCADE,
  CONSTRAINT "credentials_learnerId_definitionId_key"
    UNIQUE ("learnerId", "definitionId")
);

CREATE INDEX IF NOT EXISTS "credentials_learnerId_idx" ON "credentials"("learnerId");
CREATE INDEX IF NOT EXISTS "credentials_definitionId_idx" ON "credentials"("definitionId");
