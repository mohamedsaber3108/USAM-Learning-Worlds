-- Audit T-P1-13: legal/privacy compliance — versioned consent capture +
-- GDPR data-subject requests (export/erasure). Idempotent.

CREATE TABLE IF NOT EXISTS "consent_records" (
  "id"                 TEXT PRIMARY KEY,
  "guardianId"         TEXT NOT NULL,
  "learnerId"          TEXT NOT NULL,
  "purpose"            TEXT NOT NULL,
  "granted"            BOOLEAN NOT NULL,
  "policyVersion"      TEXT NOT NULL,
  "jurisdiction"       TEXT NOT NULL DEFAULT 'US',
  "verificationMethod" TEXT,
  "ipAddress"          TEXT,
  "userAgent"          TEXT,
  "grantedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt"          TIMESTAMP(3),
  CONSTRAINT "consent_records_guardianId_fkey"
    FOREIGN KEY ("guardianId") REFERENCES "guardians"("id") ON DELETE CASCADE,
  CONSTRAINT "consent_records_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "consent_records_guardianId_idx" ON "consent_records"("guardianId");
CREATE INDEX IF NOT EXISTS "consent_records_learnerId_idx" ON "consent_records"("learnerId");
CREATE INDEX IF NOT EXISTS "consent_records_purpose_idx" ON "consent_records"("purpose");

CREATE TABLE IF NOT EXISTS "data_subject_requests" (
  "id"                    TEXT PRIMARY KEY,
  "learnerId"             TEXT NOT NULL,
  "requestedByGuardianId" TEXT,
  "type"                  TEXT NOT NULL,
  "status"                TEXT NOT NULL DEFAULT 'PENDING',
  "exportLocation"        TEXT,
  "notes"                 TEXT,
  "requestedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"           TIMESTAMP(3),
  CONSTRAINT "data_subject_requests_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "data_subject_requests_learnerId_idx" ON "data_subject_requests"("learnerId");
CREATE INDEX IF NOT EXISTS "data_subject_requests_status_idx" ON "data_subject_requests"("status");
CREATE INDEX IF NOT EXISTS "data_subject_requests_type_idx" ON "data_subject_requests"("type");
