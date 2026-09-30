# FINAL ENTITLEMENT MATRIX

> The frontend reads REAL entitlements from `GET /api/entitlements/me`. There
> must be NO scattered `if (plan === 'premium')` logic in components — gating is
> driven by the plan's `features` object (boolean flags via `hasFeature`, numeric
> limits via `getLimit`). Source: code trace of `entitlements.service.ts`
> 2026-09-30.

## Model (code-traced)

- **Owner of entitlements = the billing owner (a `User`).** For a learner, the
  effective owner is resolved as: the learner's active guardian's `userId`, else
  the learner's own `userId` (self-managed). Never throws — unresolved owner ⇒
  FREE-tier downstream.
- **Active plan** = the owner's `ACTIVE`/`TRIALING` subscription's plan, else the
  `FREE` plan (seeded by migration). Never null in normal operation.
- **`Plan.features` (JSON)** holds:
  - boolean flags → `hasFeature(owner, 'voice')` returns `features.voice === true`
  - numeric limits → `getLimit(owner, 'missionsPerDay')` returns the number or
    `null`. **`null` limit = unlimited** (paid tiers set it null).
- **Known enforced limit:** `missionsPerDay`. `assertCanStartMission` counts
  `MissionRun`s STARTED today (UTC); FREE default when no owner resolvable = `3`.
  Resuming an already-started run is never blocked (only *starting* counts).
  On cap: `403` with message "reached today's limit of N missions on the free
  plan... upgrade for unlimited missions."
- **Referenced limit key:** `maxLearners` (per guardian) — read via `getLimit`.
- **Subscriptions** go through a `PaymentProvider` abstraction. The current
  provider is **manual/free** (activates immediately, `activated:true`,
  `checkoutUrl:null`). A real gateway would return a `checkoutUrl` and activate
  on webhook (`TRIALING` until confirmed). **No live payment processor is wired
  today** — the FE must not fake a checkout/payment UI as if money moves.
- **Cancel** = `cancelAtPeriodEnd` (keeps access until period end).

## Plan → capability (feature-flag driven; actual plans come from `GET /entitlements/plans`)

> Exact plan codes/prices/feature values are DATA (seeded `Plan` rows), not
> hardcoded here. The FE must render them from the live catalog. The matrix
> below documents the *shape* of gating the FE implements, keyed on feature
> flags, so adding a plan or changing a limit requires zero FE code change.

| Capability | Gate mechanism | FREE (fallback) | Paid (example) | FE behavior when locked |
| --- | --- | --- | --- | --- |
| Start mission | limit `missionsPerDay` | `3`/day | `null` (unlimited) | Show remaining count; on cap show upgrade CTA + honest "come back tomorrow" |
| Voice companion | flag `voice` | (data) | (data) | If false OR provider-gated → hide/disable with honest state (also BLOCKED_EXTERNAL) |
| Max children per guardian | limit `maxLearners` | (data) | (data) | Block "add child" past limit with upgrade CTA |
| Advanced/premium content | flag(s) per catalog | (data) | (data) | Locked state + upgrade CTA, never fake unlock |

## FE rules

1. Fetch entitlements once (`GET /entitlements/me`) into a typed entitlements
   store; expose `hasFeature(flag)` / `getLimit(key)` helpers mirroring the
   backend. Never inspect plan codes in components.
2. Every locked surface uses the shared "entitlement locked" state (see state
   matrix) with a real upgrade path to the plan catalog.
3. The backend is the enforcement point — a locked action that slips through the
   UI still returns `403`, which the FE must handle gracefully.
4. Do not render a payment/checkout experience that implies a live processor.
   Subscribe currently activates via the manual provider; represent it honestly
   (e.g. "activate plan") until a real gateway is wired (tracked as a backend
   gap / external dependency).
