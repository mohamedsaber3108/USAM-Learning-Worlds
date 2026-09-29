# Age Model — canonical resolution

## Decision (migration-safe)

The apparent "age-band mismatch" between the code and the Product Bible is a
**display-label** concern, not a data-model defect. **No enum migration is
performed.**

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

## Compatibility / backfill

None required. Existing learner records keep their `AGE_8_9`/`AGE_10_11`/
`AGE_12_14` values; only the presentation changed. If a future product decision
demands real enum values of `AGE_7_9` etc., that is a separate, explicitly
owner-approved migration (Prisma migration + `UPDATE learners SET age_band = ...`
backfill + code/seed sweep) — out of scope here.
