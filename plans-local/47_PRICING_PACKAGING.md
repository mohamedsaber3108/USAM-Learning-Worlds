# 47 — Pricing & Packaging

> Spec-first per mandate §10, §11, §36 ("do not implement pricing UI before the
> package model is defined"). Defines the plans, what each grants, and the
> prices, mapped onto the **existing** backend `Plan`/`Subscription` models and
> the `entitlements` engine — no schema rewrite required.

Last updated: 2026-09-23 · HEAD `2b9e92e`

---

## 1. What already exists (build on, don't reinvent)

Verified in the codebase:

- **`Plan`** (Prisma): `code` (e.g. `FREE`/`FAMILY`/`SCHOOL`), `name`,
  `priceCents`, `currency`, `interval` (`MONTH`/`YEAR`), `features` (JSON of
  flags + limits), `isActive`.
- **`Subscription`**: `ownerUserId` (a guardian), `planId`, `status`,
  `provider` (`manual` = comped/admin), `providerRef`, `currentPeriodEnd`,
  `cancelAtPeriodEnd`.
- **`EntitlementsService`**: `getActivePlan(user)` (falls back to `FREE`),
  `hasFeature(user, flag)`, `getLimit(user, key)`, `subscribe()`, `cancel()`.
- Payment provider is abstracted (`payment-provider.interface.ts` +
  `manual-payment.provider.ts`) — a real gateway slots in later.

**Implication:** packaging is a *data + product* decision, expressed as `Plan`
rows and their `features` JSON. The gates already read from it.

## 2. Product → Plan → Entitlement model

```
Product: "USAM for Kids"
  └── Plans (billed to a guardian, cover 1..N child learners)
        ├── FREE      — try the world, limited
        ├── EXPLORER  — 1 learner, full learning
        ├── FAMILY    — up to 4 learners, full + voice/AI
        └── SCHOOL    — org-billed, per-seat (B2B)
  └── Entitlement = active plan's `features` JSON
        (booleans → hasFeature, numbers → getLimit)
```

## 3. Plans

Prices are **launch hypotheses** for the MENA/Egypt-plus-international market,
anchored to competitor research (§5). USD list; local currency + PPP handled at
billing. All child accounts belong to a guardian who owns the subscription.

### FREE — `code: FREE`, $0
The always-on trial-of-the-world. Enough to feel the product and complete the
first-session journey, capped to create a reason to upgrade.
```json
{
  "maxLearners": 1,
  "worlds": "sampler",          // first world + samplers of others
  "missionsPerDay": 3,
  "aiTutor": false,
  "voice": false,
  "credentials": false,         // can earn, cannot export/verify
  "portfolioExport": false,
  "parentReports": "basic"
}
```

### EXPLORER — `code: EXPLORER`, $9.99/mo or $79.99/yr (≈$6.67/mo)
One learner, the full learning product.
```json
{
  "maxLearners": 1,
  "worlds": "all",
  "missionsPerDay": null,       // unlimited
  "aiTutor": true,
  "voice": false,               // voice reserved for FAMILY (cost control)
  "credentials": true,
  "portfolioExport": true,
  "parentReports": "full"
}
```

### FAMILY — `code: FAMILY`, $16.99/mo or $129.99/yr (≈$10.83/mo)
Up to 4 learners, everything, including voice. The headline plan.
```json
{
  "maxLearners": 4,
  "worlds": "all",
  "missionsPerDay": null,
  "aiTutor": true,
  "voice": true,
  "credentials": true,
  "portfolioExport": true,
  "parentReports": "full",
  "voiceMinutesPerLearnerPerMonth": 120
}
```

### SCHOOL — `code: SCHOOL`, custom (per-seat, org-billed)
B2B. Per-student seat pricing, admin roster, class reports. Billing owner is an
org, which the `Subscription.ownerUserId`-as-plain-id design already anticipates.
```json
{
  "maxLearners": null,          // seat-metered, set per contract
  "worlds": "all",
  "aiTutor": true,
  "voice": true,
  "credentials": true,
  "portfolioExport": true,
  "parentReports": "full",
  "adminRoster": true,
  "classReports": true
}
```

## 4. Trial & conversion

- **7-day full trial of FAMILY** on signup (matches the category norm), then
  drops to FREE unless a plan is chosen. Reminder before trial end.
- Trial is modeled as a `Subscription` with `status = TRIALING` (add to
  `SubscriptionStatus` enum) and `currentPeriodEnd = now + 7d`; on expiry the
  entitlement resolver falls back to FREE (already the default behavior).

## 5. Competitor anchors (research, §19)

Content rephrased for compliance with source licensing:

- **Duolingo** — free tier; Super family ≈ $120/yr for up to 6 users
  (~$1.67/user/mo annual). Single-domain (languages). Source: [bonjouridee](https://www.bonjouridee.com/en/complete-guide-to-duolingo-family-plan-cost-in-2026/), [Duolingo blog](https://blog.duolingo.com/plus-family-plan/).
- **Khan Academy Kids** — free for families; schools ≈ $5/student for reporting
  & implementation. Source: [khanacademy.org](https://www.khanacademy.org/kids/pricing).
- **Prodigy** — ≈ $9.95/mo or ≈ $118.95/yr (annual ≈ $4.91/mo). Single-domain
  (math). Source: [brighterly](https://brighterly.com/blog/prodigy-membership-cost/).

**Positioning:** USAM is multi-domain (English + coding + AI + projects + voice),
so it sits above single-subject apps but must stay family-affordable. FAMILY at
≈$130/yr is competitive with Duolingo's family plan while covering far more
scope. Egypt/MENA gets local-currency + PPP-adjusted pricing at billing time
(a later gateway concern), not a separate plan model.

## 6. Feature-flag key registry (single source for gates)

The keys the app may check via `hasFeature`/`getLimit`. Any gated UI must use
these exact keys, never hard-coded plan names (mandate §30):

| Key | Type | Meaning |
| --- | --- | --- |
| `maxLearners` | number\|null | child accounts under the guardian (null = unmetered/seat) |
| `worlds` | `"sampler"`\|`"all"` | world access breadth |
| `missionsPerDay` | number\|null | daily mission cap (null = unlimited) |
| `aiTutor` | boolean | AI tutor access |
| `voice` | boolean | realtime voice features |
| `voiceMinutesPerLearnerPerMonth` | number | voice usage cap |
| `credentials` | boolean | export/verify Open Badges |
| `portfolioExport` | boolean | export portfolio/evidence |
| `parentReports` | `"basic"`\|`"full"` | parent dashboard depth |
| `adminRoster` / `classReports` | boolean | SCHOOL only |

## 7. Sequencing (feeds 67_IMPLEMENTATION_SEQUENCE)

1. **This spec + `48_BUSINESS_MODEL.md`** (done in this batch).
2. Seed the four plans (`FREE/EXPLORER/FAMILY/SCHOOL`) via migration with the
   `features` payloads above; add `TRIALING` to `SubscriptionStatus`.
3. Wire real gates: `missionsPerDay`, `voice`, `aiTutor`, `maxLearners` on the
   existing engines using `hasFeature`/`getLimit`.
4. THEN pricing/plan UI (a `/plans` page + upgrade flow) — never before 1–3.
5. Real payment gateway behind the existing provider interface (separate slice).
