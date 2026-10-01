# 11 — PRICING MODEL

> Per directive §25: research competitor pricing → unit economics → package arch
> → entitlement arch → recommended SCENARIOS → make price VALUES configurable →
> flag final commercial price for owner approval before charging real customers.
> MERGES prior `47_PRICING_PACKAGING.md` §3/§5 and `48_BUSINESS_MODEL.md`.
> **Price VALUES are configurable (`Plan.priceCents`); nothing hardcoded in UI.**

Date: 2026-09-30

---

## 1. Competitor anchors (2026, from 05 §1 — verify before any commercial use)

- Duolingo Super family ≈ $119.99/yr (6 users); Duolingo Max ≈ $19.99/mo, Max
  family ≈ $239.99/yr. Khanmigo ≈ $4/mo or $44/yr (parent sub up to 10 kids).
  Khan Kids free. Prodigy ≈ $118.95/yr. Sources linked in 05.
- Read: single-domain family plans cluster ~$120/yr; AI add-ons $4–20/mo.

## 2. Positioning

USAM is multi-domain (4 pillars) + AI + voice + characters + projects + portfolio
+ credentials → prices ABOVE single-subject apps, BELOW "premium AI" ceiling,
stays family-affordable. The headline is **FAMILY**.

## 3. Recommended pricing scenarios (hypotheses — NOT final; owner sign-off req.)

USD list; local currency + PPP (esp. MENA/Egypt) handled at billing, not as
separate plan models.

| Plan | Monthly | Annual (≈/mo) | Rationale |
|---|---|---|---|
| FREE | $0 | $0 | acquisition funnel; capped |
| EXPLORER | ~$9.99 | ~$79.99 (~$6.67) | one child, full learning; matches category single-user |
| FAMILY | ~$16.99 | ~$129.99 (~$10.83) | up to 4, +voice; between Duolingo Super-family and Max-family |
| SCHOOL | custom per-seat | — | B2B, org-billed |

Trial: 7-day full FAMILY on signup (`Subscription.status = TRIALING`,
`currentPeriodEnd = now+7d`), then falls back to FREE (entitlement resolver
defaults to FREE already). (47 §4.)

## 4. Unit economics (model — must be measured; from 48 §2)

Cost drivers that scale = **AI + voice**; rest ~fixed. Margin protections baked
into packaging: voice is FAMILY-only + minute-capped (highest cost behind highest
price + hard cap); AI off on FREE (~zero variable cost on acquisition tier);
`missionsPerDay` caps FREE generation. Contribution margin per paying account =
`price − (AI + voice + payment fees + amortized ops)`. **Action:** instrument
real AI+voice cost per learner once live; revisit cap + price. Do NOT treat
model numbers as validated (48 §6 risk: AI/voice cost variance is the top risk).

## 5. Configurability (hard requirement, directive §25)

- Price VALUES live in `Plan.priceCents`/`currency`/`interval` (DB), never in
  frontend/backend code.
- Feature breadth lives in `Plan.features` JSON (10 §4), checked via
  `hasFeature`/`getLimit`.
- Changing a price or a cap = a data change (+ optional migration), not a code
  change across surfaces.

## 6. Owner-approval gate (irreversible decision)

Per directive §25 + the standing escalation rule: **final commercial price
charged to real customers requires explicit owner approval** before a live
payment gateway is enabled. Everything up to that (plan seed, gates, upgrade UI
with configurable display prices, manual/trial provider) proceeds without
blocking. The real payment gateway integration is a separate slice behind the
existing provider interface.

## 7. Open pricing questions (carry forward — 48 §6)

MENA willingness-to-pay / PPP (validate with a small price test); FREE tier
generosity tuning from funnel data; SCHOOL per-seat number pending B2B motion.
