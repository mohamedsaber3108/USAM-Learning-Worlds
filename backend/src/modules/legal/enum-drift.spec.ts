import {
  ConsentPurpose,
  DataSubjectRequestType,
  DataSubjectRequestStatus,
  ContentSourceType,
} from '@prisma/client';

/**
 * Regression guard for the enum-drift bug class (audit 71).
 *
 * Several fields were declared as Prisma enums while their DB columns were
 * created as plain TEXT with the Postgres enum type never created — so the
 * generated client cast to a nonexistent type and every query 500'd
 * (SubscriptionStatus was the first one found, in production).
 *
 * Migration 20260930_fix_enum_drift.sql creates the missing enum types and
 * converts the columns. This test pins the EXACT value set the generated Prisma
 * client expects for each fixed enum, so it MUST equal the `CREATE TYPE … AS
 * ENUM (...)` list in that migration. If someone edits the schema enum without
 * updating the migration (or vice versa), this test fails and flags the drift
 * before it reaches a live query.
 *
 * These are the value lists as of the fix — keep them in lockstep with
 * 20260930_fix_enum_drift.sql and 20260903_add_asset_provenance_fields_cluster9.sql.
 */
describe('enum drift regression — generated client value sets match migrations', () => {
  it('ConsentPurpose', () => {
    expect(Object.values(ConsentPurpose).sort()).toEqual(
      [
        'ESSENTIAL_SERVICE',
        'PERSONALIZATION',
        'AI_PROCESSING',
        'VOICE_PROCESSING',
        'COMMUNITY',
        'ANALYTICS',
      ].sort(),
    );
  });

  it('DataSubjectRequestType', () => {
    expect(Object.values(DataSubjectRequestType).sort()).toEqual(['EXPORT', 'DELETION'].sort());
  });

  it('DataSubjectRequestStatus', () => {
    expect(Object.values(DataSubjectRequestStatus).sort()).toEqual(
      ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].sort(),
    );
  });

  it('ContentSourceType', () => {
    expect(Object.values(ContentSourceType).sort()).toEqual(
      ['SEEDED', 'AI_GENERATED', 'HUMAN_AUTHORED'].sort(),
    );
  });
});
