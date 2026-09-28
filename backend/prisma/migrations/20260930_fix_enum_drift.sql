-- Audit 71: fix schema<->DB enum drift (same bug class as SubscriptionStatus).
--
-- These columns are declared as ENUMS in schema.prisma and the generated Prisma
-- client casts to the Postgres enum type — but the original migrations created
-- the columns as plain TEXT and never created the enum type. Unlike the
-- Subscription/Plan case (fixed by downgrading the field to String, because no
-- code used the TS enum), these enums ARE imported and iterated from
-- @prisma/client (e.g. Object.values(ConsentPurpose)), so the correct fix is to
-- make the DB match the schema: create the enum type and convert the column.
--
-- Idempotent + non-destructive: the enum types are created behind a
-- duplicate_object guard; the column conversions are skipped if the column is
-- already the target type; existing TEXT values are all valid enum members, so
-- the USING cast cannot lose data.

-- ---------- ConsentPurpose (consent_records.purpose) ----------
DO $$ BEGIN
  CREATE TYPE "ConsentPurpose" AS ENUM (
    'ESSENTIAL_SERVICE','PERSONALIZATION','AI_PROCESSING','VOICE_PROCESSING','COMMUNITY','ANALYTICS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name='consent_records' AND column_name='purpose') = 'text' THEN
    ALTER TABLE "consent_records"
      ALTER COLUMN "purpose" TYPE "ConsentPurpose" USING "purpose"::"ConsentPurpose";
  END IF;
END $$;

-- ---------- DataSubjectRequestType (data_subject_requests.type) ----------
DO $$ BEGIN
  CREATE TYPE "DataSubjectRequestType" AS ENUM ('EXPORT','DELETION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name='data_subject_requests' AND column_name='type') = 'text' THEN
    ALTER TABLE "data_subject_requests"
      ALTER COLUMN "type" TYPE "DataSubjectRequestType" USING "type"::"DataSubjectRequestType";
  END IF;
END $$;

-- ---------- DataSubjectRequestStatus (data_subject_requests.status) ----------
DO $$ BEGIN
  CREATE TYPE "DataSubjectRequestStatus" AS ENUM ('PENDING','PROCESSING','COMPLETED','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name='data_subject_requests' AND column_name='status') = 'text' THEN
    -- Drop the TEXT default before the type change, then re-add it typed.
    ALTER TABLE "data_subject_requests" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "data_subject_requests"
      ALTER COLUMN "status" TYPE "DataSubjectRequestStatus" USING "status"::"DataSubjectRequestStatus";
    ALTER TABLE "data_subject_requests"
      ALTER COLUMN "status" SET DEFAULT 'PENDING'::"DataSubjectRequestStatus";
  END IF;
END $$;

-- ---------- ContentSourceType (content_sources.sourceType) ----------
-- The enum type already exists (created in 20260903_add_asset_provenance_fields_cluster9.sql
-- and used correctly by content_items.sourceType). Only content_sources.sourceType
-- drifted to TEXT — align it to the existing enum.
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name='content_sources' AND column_name='sourceType') = 'text' THEN
    ALTER TABLE "content_sources" ALTER COLUMN "sourceType" DROP DEFAULT;
    ALTER TABLE "content_sources"
      ALTER COLUMN "sourceType" TYPE "ContentSourceType" USING "sourceType"::"ContentSourceType";
    ALTER TABLE "content_sources"
      ALTER COLUMN "sourceType" SET DEFAULT 'HUMAN_AUTHORED'::"ContentSourceType";
  END IF;
END $$;
