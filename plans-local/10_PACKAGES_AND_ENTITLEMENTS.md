# 10 — PACKAGES & ENTITLEMENTS

> The commercial product structure. MERGES prior `47_PRICING_PACKAGING.md`
> (which is accurate — Plan/Subscription/EntitlementsService verified to exist).
> This doc updates it for the LOCKED 4-domain scope and resolves the
> "explicit Package entity vs features-JSON" decision. Pricing numbers live in 11.

Date: 2026-09-30

---

## 1. Verified backend reality (build on, don't reinvent)

`Plan` (code, name, priceCents, currency, interval TEXT MONTH|YEAR|ONE_TIME,
features JSON, isActive) + `Subscription` (ownerUserId=guardian, planId, status,
provider, currentPeriodEnd, cancelAtPeriodEnd) + `EntitlementsService`
(getActivePlan/hasFeature/getLimit/subscribe/cancel) + payment abstraction
(`payment-provider.interface.ts`, `manual-payment.provider.ts`). Migration
`20260916_add_entitlements.sql`. Real gateway = still external.

## 2. DECISION — packaging via `Plan.features` JSON (no new `Package` entity now)

Directive §24 asks for PRODUCT→PACKAGE→PLAN→ENTITLEMENT→CHILD ACCESS→USAGE.
The backend expresses this as:
```
Product "USAM for Kids"
  └ Plan (billed to a guardian; covers 1..N child Learners)   = the PACKAGE
       └ features JSON = ENTITLEMENTS (booleans → hasFeature, numbers → getLimit)
       └ Subscription  = the purchase + period + provider
       └ Guardianship  = CHILD ACCESS (which learners the plan covers)
       └ usage meters  = USAGE LIMITS (e.g. voiceMinutes, missionsPerDay)
```
**Decision: a Plan IS a Package.** Do NOT add a separate `Package` model now —
it would duplicate `Plan` for a 4-plan catalog (premature abstraction). Revisit
only if we later sell à-la-carte single-domain packs (then a `Package`↔`Plan`
composition is additive). Recorded so it's a conscious choice, not an oversight.

## 3. Plans (updated for 4-domain scope)

All four domains (English/Coding/AI/Entrepreneurship) are part of the learning
product; plans gate BREADTH, AI/voice, learners, and reporting — NOT which
domains exist. (This differs from selling domains separately — rejected per §24
"do not assume each domain sold separately".)

| Plan `code` | Who | Learners | Domains | AI tutor | Voice | Credentials/Export | Parent reports |
|---|---|---|---|---|---|---|---|
| **FREE** | acquisition | 1 | sampler (first world each + caps) | off | off | earn, no export | basic |
| **EXPLORER** | 1 child | 1 | all 4 full | on | off | yes | full |
| **FAMILY** | household | up to 4 | all 4 full | on | **on** (capped) | yes | full |
| **SCHOOL** | B2B (future) | seat-metered | all 4 full | on | on | yes | full + class/roster |

FREE caps: `missionsPerDay: 3`, `worlds: "sampler"`. FAMILY voice:
`voiceMinutesPerLearnerPerMonth` capped (margin lever — 48 §2). Full `features`
JSON payloads: see 47 §3 (carried forward; adjust `worlds` to span 4 domains).

## 4. Feature-flag key registry (single source for gates — from 47 §6)

`maxLearners` · `worlds` (sampler|all) · `missionsPerDay` (num|null) · `aiTutor`
(bool) · `voice` (bool) · `voiceMinutesPerLearnerPerMonth` (num) · `credentials`
(bool) · `portfolioExport` (bool) · `parentReports` (basic|full) · `adminRoster`
/ `classReports` (SCHOOL). **Rule (§30): gated UI uses these keys via
`hasFeature`/`getLimit`, never hardcoded plan names.**

## 5. Child access & purchasing rules

- A **child never purchases** (directive §25). Purchasing belongs to the guardian
  who owns the `Subscription`.
- `Guardianship` links guardian↔learner = child access control.
- `maxLearners` enforced server-side on learner creation under a guardian.

## 6. Usage limits (must be enforced server-side)

`missionsPerDay` and `voiceMinutesPerLearnerPerMonth` enforced via `getLimit` +
a usage meter (meter is the one piece still to build — 47 §7 step 3 / 48 §3).
Every AI/voice call attributable to learner+plan for cost measurement.

## 7. Sequencing (unchanged from 47 §7 — spec before UI)

1. Seed the 4 plans with `features` payloads (migration exists pattern).
2. Wire real gates (`missionsPerDay`, `voice`, `aiTutor`, `maxLearners`).
3. THEN pricing/upgrade UI. 4. THEN real payment gateway behind the interface.
No pricing UI ships before plan seed + gates (directive §36).
