-- G-4 (plans-local/47_PRICING_PACKAGING.md): seed the four product plans with
-- the spec'd `features` payloads. Idempotent — safe to re-run. Uses ON CONFLICT
-- to UPDATE existing rows so the FREE plan seeded by 20260916_add_entitlements
-- is brought in line with the spec (adds worlds/missionsPerDay/credentials/etc,
-- turns aiTutor OFF on FREE per the cost-governance decision in 48_BUSINESS_MODEL).
--
-- Feature keys are the registry in 47 §6; gates read them via
-- EntitlementsService.hasFeature()/getLimit(). Prices are launch hypotheses.

-- FREE — acquisition funnel; capped, AI/voice OFF (zero variable cost).
INSERT INTO "plans" ("id", "code", "name", "description", "priceCents", "currency", "interval", "features", "isActive")
VALUES (
  gen_random_uuid()::text, 'FREE', 'Free',
  'Try the world — first world plus samplers, three missions a day.',
  0, 'USD', 'MONTH',
  '{"maxLearners": 1, "worlds": "sampler", "missionsPerDay": 3, "aiTutor": false, "voice": false, "credentials": false, "portfolioExport": false, "parentReports": "basic"}',
  true
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "priceCents" = EXCLUDED."priceCents",
  "currency" = EXCLUDED."currency",
  "interval" = EXCLUDED."interval",
  "features" = EXCLUDED."features",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

-- EXPLORER — one learner, full learning, AI tutor on, voice off.
INSERT INTO "plans" ("id", "code", "name", "description", "priceCents", "currency", "interval", "features", "isActive")
VALUES (
  gen_random_uuid()::text, 'EXPLORER', 'Explorer',
  'One learner, the full learning product with the AI tutor.',
  999, 'USD', 'MONTH',
  '{"maxLearners": 1, "worlds": "all", "missionsPerDay": null, "aiTutor": true, "voice": false, "credentials": true, "portfolioExport": true, "parentReports": "full"}',
  true
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "priceCents" = EXCLUDED."priceCents",
  "currency" = EXCLUDED."currency",
  "interval" = EXCLUDED."interval",
  "features" = EXCLUDED."features",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

-- FAMILY — up to 4 learners, everything incl. minute-capped voice. Headline plan.
INSERT INTO "plans" ("id", "code", "name", "description", "priceCents", "currency", "interval", "features", "isActive")
VALUES (
  gen_random_uuid()::text, 'FAMILY', 'Family',
  'Up to four learners, everything — including voice.',
  1699, 'USD', 'MONTH',
  '{"maxLearners": 4, "worlds": "all", "missionsPerDay": null, "aiTutor": true, "voice": true, "credentials": true, "portfolioExport": true, "parentReports": "full", "voiceMinutesPerLearnerPerMonth": 120}',
  true
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "priceCents" = EXCLUDED."priceCents",
  "currency" = EXCLUDED."currency",
  "interval" = EXCLUDED."interval",
  "features" = EXCLUDED."features",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

-- SCHOOL — B2B, org-billed, per-seat. maxLearners null = seat-metered per contract.
INSERT INTO "plans" ("id", "code", "name", "description", "priceCents", "currency", "interval", "features", "isActive")
VALUES (
  gen_random_uuid()::text, 'SCHOOL', 'School',
  'For classrooms — per-seat, with admin roster and class reports.',
  0, 'USD', 'MONTH',
  '{"maxLearners": null, "worlds": "all", "missionsPerDay": null, "aiTutor": true, "voice": true, "credentials": true, "portfolioExport": true, "parentReports": "full", "adminRoster": true, "classReports": true}',
  true
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "priceCents" = EXCLUDED."priceCents",
  "currency" = EXCLUDED."currency",
  "interval" = EXCLUDED."interval",
  "features" = EXCLUDED."features",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;
