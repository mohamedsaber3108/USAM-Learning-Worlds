# Age Model — COMPATIBILITY MODE / MIGRATION PENDING

> **Status: COMPATIBILITY MODE / MIGRATION PENDING.** NOT fully resolved. The
> canonical product age model is **7–9 / 10–12 / 13–15**. The persisted backend
> `AgeBand` enum (`AGE_8_9`/`AGE_10_11`/`AGE_12_14`) does NOT cleanly represent
> age 7 or 15 and has different numeric boundaries. Today a **presentation
> compatibility layer** (`frontend/src/lib/age/ageLabels.ts`) maps the legacy
> enum to the canonical product bands for display. The persistence model has
> **not** been migrated. Do not classify the age model as done until the
> canonical backend learner model is actually migrated (a deliberate,
> owner-approved, non-destructive migration — see plan below).

## Current state (compatibility layer, NOT a migration)

The apparent "age-band mismatch" is handled at the **display layer only**. **No
enum migration has been performed.**

| Persisted legacy band (DB/Prisma `AgeBand`) | Canonical product band (Bible) | Compatibility mapping (display) |
| --- | --- | --- |
| `AGE_8_9` | 7–9 | shown as "7-9" |
| `AGE_10_11` | 10–12 | shown as "10-12" |
| `AGE_12_14` | 13–15 | shown as "13-15" |

**Known imperfection:** the legacy enum's numeric boundaries (8-9/10-11/12-14) do
not equal the canonical boundaries (7-9/10-12/13-15). Age 7 and age 15 are not
distinctly representable in the persisted model; the mapping is a pragmatic
alignment, not an exact equivalence. This is acceptable for launch (labels read
correctly to users; adaptation still keys on a stable enum) but is tracked as
migration-pending debt.

- Backend `AgeBand` enum (Prisma + Postgres): `AGE_8_9`, `AGE_10_11`, `AGE_12_14`.
  These are **stable internal identifiers**.
- Product-facing developmental bands (Bible, `plans-local/01_PRODUCT_NORTH_STAR.md`):
  **7–9**, **10–12**, **13–15**.
- The North Star itself documents the mapping explicitly
  (`AGE_8_9` = 7–9, `AGE_10_11` = 10–12, `AGE_12_14` = 13–15) and notes the enum
  is an internal representation of the product-facing grouping.

## Why NOT rename the enum

Renaming would be a catastrophic, hard-to-reverse migration:

- a Postgres enum type migration + backfill of **every existing learner record**
  (`Learner.ageBand`),
- ~400 `AGE_*` literal references across backend seeds/DTOs/eligibility/recommendations,
- re-seeding age-targeted content (missions, creativity prompts, cross-curricular concepts).

The blast radius and breakage risk are not justified when the values are already
a documented internal encoding of the correct product bands.

## The translation layer (single source of truth)

`frontend/src/lib/age/ageLabels.ts` maps enum → product-facing range:

```
AGE_8_9   → "7-9"
AGE_10_11 → "10-12"
AGE_12_14 → "13-15"
```

Rule: **never render the raw enum's own numbers (8-9/10-11/12-14) to a user.**
Use `ageRange(band)` (or a localized label built from it). The enum value is
only ever used as an internal key (adaptation table, API payloads, storage).

### Surfaces corrected to product-facing labels

- Onboarding age select (`onboarding.age.bands.*.label`, en + ar) → 7-9 / 10-12 / 13-15.
- Creativity Studio age filter/badges (`CreativityGalleryPage`).
- Cross-curricular age filter + concept age badge (`CrossCurricularPage`).
- Parent dashboard child age (`ParentDashboardPage`).

`useAgeAdaptation` continues to key its adaptation table on the enum value
(correct — it needs a stable key, not a display string).

## Migration plan (pending, owner-approved, non-destructive)

The launch is NOT blocked on this. When the canonical persistence model is
migrated, do it additively and safely:

1. Add new enum values `AGE_7_9`, `AGE_10_12`, `AGE_13_15` to the Postgres
   `AgeBand` type (additive — Postgres allows `ALTER TYPE ... ADD VALUE`; does
   not break existing rows).
2. Dual-read period: `ageLabels.ts` + `useAgeAdaptation` accept BOTH old and new
   values; onboarding writes the new values.
3. Backfill: `UPDATE learners SET age_band = <new> WHERE age_band = <old>` under
   the documented mapping, in a reviewed migration with a rollback.
4. Sweep the ~400 `AGE_*` references in seeds/DTOs/eligibility/recommendations to
   the new values; re-seed age-targeted content.
5. Retire the old enum values only after all rows are backfilled and no code
   references them.

Until step 5 completes, the age model stays **COMPATIBILITY MODE / MIGRATION
PENDING**. Do not run a destructive rename; do not block the frontend launch on it.

## Compatibility / backfill (current)

None performed yet. Existing learner records keep their `AGE_8_9`/`AGE_10_11`/
`AGE_12_14` values; only the presentation changed via the compatibility layer.
