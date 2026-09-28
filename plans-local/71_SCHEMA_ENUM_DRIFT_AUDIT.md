# 71 — Schema / Enum Drift Audit (platform-wide)

> Trigger: the `SubscriptionStatus` / `BillingInterval` production defect — Prisma
> enum fields whose DB columns were created as plain `TEXT`, with the Postgres
> enum type never created, so the generated client cast to a nonexistent type and
> every query 500'd. This audit finds every instance of that bug class.
>
> Method: cross-referenced every `enum` in `backend/prisma/schema.prisma` against
> `CREATE TYPE`/column definitions in `backend/prisma/migrations/*.sql`, and
> against `@prisma/client` enum usage in `backend/src`. Evidence via direct file
> reads (ripgrep was unreliable on these SQL files).
>
> Sources of truth: Prisma schema → generated client (what code casts to). Raw SQL
> migrations → the live Postgres DB (this project applies raw SQL; it does NOT run
> `prisma migrate`). Drift = these two disagree on whether a column is an enum type.

## Architectural caveat (important)
The migrations folder is **not a complete history** — there is no baseline/init
migration. Core tables (`users`, `learners`, `guardians`, `activities`, `missions`,
`mission_runs`, `projects`, `mastery_records`, `evidence`, `characters`, `domains`,
`skills`, `competencies`, `learning_objectives`, `progression`, …) and ~18 of their
enum types are created by an untracked baseline (original `prisma db push`). For
enums used only by those tables, the migration files can't prove enum-vs-TEXT — they
need a **live DB spot check** (`SELECT typname FROM pg_type` / `\d+ <table>`). Those
are listed in §D as "unverified", not "safe".

---

## A. CONFIRMED DRIFT — schema enum, DB column TEXT, enum type never created

| # | Entity.field | Prisma type | DB (migration) | Enum type exists? | Code uses TS enum? | Risk | Fix |
|---|---|---|---|---|---|---|---|
| 1 | `Subscription.status` | ~~SubscriptionStatus~~ → **String** (FIXED `b1b44cd`) | TEXT (`20260916_add_entitlements.sql`) | no | no | was CRITICAL (blocked all mission starts) | done — field→String |
| 2 | `Plan.interval` | ~~BillingInterval~~ → **String** (FIXED `b1b44cd`) | TEXT (`20260916_add_entitlements.sql`) | no | no | was latent (fires when a subscription row exists) | done — field→String |
| 3 | `ConsentRecord.purpose` | `ConsentPurpose` | TEXT (`20260916_add_legal_compliance.sql`) | no | **YES** (`Object.values(ConsentPurpose)`, controller DTO) | HIGH — any consent read/write 500s | **create enum type + convert column** (keep enum; code depends on it) |
| 4 | `DataSubjectRequest.type` | `DataSubjectRequestType` | TEXT (`20260916_add_legal_compliance.sql`) | no | via `@prisma/client` types | HIGH — GDPR export/erasure requests 500 | create enum type + convert column |
| 5 | `DataSubjectRequest.status` | `DataSubjectRequestStatus` | TEXT DEFAULT 'PENDING' (`20260916_add_legal_compliance.sql`) | no | via `@prisma/client` types | HIGH — same path | create enum type + convert column |

Note the fix DIRECTION differs from #1/#2. For subscriptions, nothing used the TS
enum and the values are free-form billing states → downgrading to `String` was
correct and needed no DB change. For #3–#5 the enums are semantically fixed sets and
**code imports/iterates them from `@prisma/client`**, so downgrading to `String`
would break compilation and lose type safety. Correct fix = make the DB match the
schema: `CREATE TYPE` + `ALTER COLUMN … TYPE … USING`. Idempotent, values already
valid, no data loss.

## B. PARTIAL DRIFT — enum type exists, one column uses TEXT

| # | Entity.field | Prisma type | DB (migration) | Note | Fix |
|---|---|---|---|---|---|
| 6 | `ContentSource.sourceType` | `ContentSourceType` | TEXT (`20260916_add_content_provenance.sql`) | The `ContentSourceType` type EXISTS (created in `20260903_add_asset_provenance_fields_cluster9.sql`) and is used correctly by `content_items.sourceType` (enum column). Only `content_sources.sourceType` drifted to TEXT. | convert `content_sources.sourceType` to the existing enum type (align DB→schema) |

## C. CONSISTENT — no action (schema enum ↔ migration CREATE TYPE match, values verified)
ConversationType, ConversationStatus, MessageRole, PrerequisiteType, ScaffoldLevel,
ContentType, ContentStatus, LearningEventType, CosmeticCategory, QuestionType,
NotificationType, ReflectionPromptKind, CreativitySubmissionVisibility,
ProjectCollaboratorRole, EnglishStrandFamily, BloomLevel, AssessmentPurpose,
SafetyEscalationStatus, EscalationResolutionType, ExperimentStatus, MediaAssetType,
SimulationCategory, VisualLanguageCategory, `ContentItem.sourceType` (ContentSourceType).
(ConversationType and NotificationType are extended by follow-up `ALTER TYPE`
migrations; value lists reconcile on both sides. No value add/remove/rename mismatches
found anywhere.)

## D. UNVERIFIED (baseline-only; require live-DB spot check)
No tracked `CREATE TYPE` to compare — check `pg_type` on prod:
Role, UserStatus, AgeBand, LearnerStatus, GuardianRelationship, GuardianshipStatus,
ActivityType, DifficultyLevel, MasteryState, EvidenceType, MissionType,
MissionRunStatus, ProjectState, ProjectVisibility, XPSource, CharacterRole (base 4),
InterventionTrigger, InterventionStatus. The `intervention_recommendations` table has
NO CREATE TABLE in the folder at all — highest-risk unknown.

Live check (run on prod):
```
DB_URL="$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | tr -d '"')"
# List enum types that DO exist:
psql "$DB_URL" -c "SELECT typname FROM pg_type WHERE typtype='e' ORDER BY typname;"
# For a suspect column, confirm its type is USER-DEFINED (enum) not text:
psql "$DB_URL" -c "SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE column_name IN ('role','status','state','type','difficulty','source','relationship','visibility','triggerType') ORDER BY table_name;"
```
These enums are heavily used by the live app already (auth, missions, mastery all
run), so they are almost certainly real enum types in the baseline — but the
SubscriptionStatus bug proves we must not assume. Spot-check and record results here.

## E. REVERSE DRIFT — CREATE TYPE with no Prisma enum
None found. Every `CREATE TYPE … AS ENUM` in tracked migrations maps to a live Prisma
enum. (SubscriptionStatus/BillingInterval enums were removed from the schema and were
never `CREATE TYPE`'d, so there is no orphaned Postgres type to drop.)

## F. Frontend DTO note
The frontend consumes these as string values over JSON (no Postgres coupling), so the
enum-vs-TEXT drift does not affect the wire format. Frontend types should mirror the
enum value sets; no drift-class break on the client. (Not exhaustively re-audited here —
the runtime defect is strictly backend DB casting.)

---

## Fixes applied in this pass
- Migration `20260930_fix_enum_drift.sql` (idempotent): creates the missing Postgres
  enum types `ConsentPurpose`, `DataSubjectRequestType`, `DataSubjectRequestStatus`
  and converts the TEXT columns to them; converts `content_sources.sourceType` to the
  existing `ContentSourceType`. All conversions guard existing TEXT values (already
  valid enum members) and are safe to re-run.
- Schema unchanged for #3–#6 (already declared as enums — the DB is what was wrong).
- Regression: `enum-drift.spec.ts` asserts the entitlements query shape and that the
  legal-compliance consent list enumerates all `ConsentPurpose` values without error.

## Automated protection (added)
`backend/scripts/check-enum-drift.ts` (`npm run check:enum-drift`) is the guard
against this whole bug class. It reads every Prisma enum from the generated
client's DMMF (45 enums) and diffs against the live DB's `pg_type`/`pg_enum`,
failing (exit 1) on:
- **MISSING TYPE** — a Prisma enum with no Postgres type (the SubscriptionStatus
  bug: queries casting to it 500). This is the high-signal check.
- **VALUE MISMATCH** — a Prisma enum whose values differ from the DB type.

It complements `check:migrations` (which checks table/column existence but not
TYPE-level drift). Wire both into the deploy pipeline BEFORE traffic flips, so an
enum/DB mismatch fails the deploy instead of the first production query. Run:
```
cd backend && npm run check:enum-drift    # needs DATABASE_URL
```
Note: after the fixes in this pass (Subscription/Plan → String; ConsentPurpose /
DataSubjectRequest* / ContentSource enum types created by 20260930_fix_enum_drift.sql),
this check should pass clean once that migration is applied to prod. If it reports
MISSING TYPE for any of those three, the migration hasn't been applied yet.

## §D live spot-check — RUN ON PROD (records the baseline-enum truth)
The ~18 baseline enums (Role, UserStatus, AgeBand, LearnerStatus,
GuardianRelationship, GuardianshipStatus, ActivityType, DifficultyLevel,
MasteryState, EvidenceType, MissionType, MissionRunStatus, ProjectState,
ProjectVisibility, XPSource, CharacterRole, InterventionTrigger, InterventionStatus)
have no tracked CREATE TYPE. `check:enum-drift` now covers them automatically, but
record a one-time manual snapshot too:
```
DB_URL="$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | tr -d '"')"
# All enum types + values that actually exist in prod:
psql "$DB_URL" -c "SELECT t.typname, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS values
  FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
  JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public'
  GROUP BY t.typname ORDER BY t.typname;"
```
Expected: all 45 Prisma enums present with matching values. Any Prisma enum absent
from this list is live drift. (The app already runs auth/missions/mastery, which
use Role/MissionType/MasteryState/etc., so those baseline types almost certainly
exist as real enums — but `check:enum-drift` proves it rather than assuming.)

## Follow-ups
- Run `npm run check:enum-drift` on prod after applying 20260930_fix_enum_drift.sql;
  paste output into this doc as the recorded baseline.
- Add `check:enum-drift` (and `check:migrations`) as a gate step in `scripts/deploy.sh`.
