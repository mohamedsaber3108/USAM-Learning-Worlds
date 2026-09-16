-- Audit #11: entitlement structure (no payment gateway). Idempotent.

CREATE TABLE IF NOT EXISTS "plans" (
  "id"          TEXT PRIMARY KEY,
  "code"        TEXT NOT NULL UNIQUE,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "priceCents"  INTEGER NOT NULL DEFAULT 0,
  "currency"    TEXT NOT NULL DEFAULT 'USD',
  "interval"    TEXT NOT NULL DEFAULT 'MONTH',
  "features"    JSONB NOT NULL DEFAULT '{}',
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id"                TEXT PRIMARY KEY,
  "ownerUserId"       TEXT NOT NULL,
  "planId"            TEXT NOT NULL,
  "status"            TEXT NOT NULL DEFAULT 'ACTIVE',
  "provider"          TEXT NOT NULL DEFAULT 'manual',
  "providerRef"       TEXT,
  "currentPeriodEnd"  TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscriptions_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "subscriptions_ownerUserId_idx" ON "subscriptions"("ownerUserId");
CREATE INDEX IF NOT EXISTS "subscriptions_planId_idx" ON "subscriptions"("planId");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");

-- Seed a free default plan so entitlement checks always resolve to something.
INSERT INTO "plans" ("id", "code", "name", "description", "priceCents", "features")
VALUES (
  gen_random_uuid()::text, 'FREE', 'Free', 'Default free tier', 0,
  '{"maxLearners": 1, "voice": false, "aiTutor": true}'
)
ON CONFLICT ("code") DO NOTHING;
