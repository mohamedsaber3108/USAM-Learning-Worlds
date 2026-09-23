# 48 — Business Model

> Mandate §11, §36, §48. The economics behind the packaging in
> `47_PRICING_PACKAGING.md`: how USAM makes money, what it costs to serve a
> learner, and where the margin is. Numbers are launch **models** to be
> replaced with measured actuals — flagged as such.

Last updated: 2026-09-23 · HEAD `2b9e92e`

---

## 1. Revenue model

- **B2C subscription** (primary): guardian pays for EXPLORER or FAMILY; FREE is
  the acquisition funnel; 7-day FAMILY trial converts.
- **B2B/EDU** (secondary): SCHOOL per-seat, org-billed. Higher ARPU, lower CAC
  per student, longer sales cycle.
- No ads, no data sale — this is a children's product; monetizing attention or
  data would violate the safety/COPPA posture (see `40_SAFETY.md` intent).

## 2. Unit economics (per active learner / month) — MODEL, not measured

The cost drivers that actually scale with usage are **AI** and **voice**;
everything else is roughly fixed/amortized. Rough model:

| Cost line | FREE | EXPLORER | FAMILY (per learner) |
| --- | --- | --- | --- |
| AI (LLM tutor/content) | ~$0 (off) | low–moderate | moderate |
| Voice (STT/TTS/realtime) | $0 (off) | $0 (off) | capped at 120 min/mo |
| Infra (hosting/db/storage) | low | low | low |
| Payment fees | n/a | ~3–4% + fee | ~3–4% + fee |
| Support/content ops (amortized) | low | low | low |

**Design choices that protect margin (already reflected in packaging):**
- Voice — the most expensive capability — is **FAMILY-only** and **minute-capped**
  (`voiceMinutesPerLearnerPerMonth`), so the highest cost sits behind the highest
  price and a hard limit.
- AI tutor is off on FREE, so the acquisition tier has ~zero variable cost.
- `missionsPerDay` cap on FREE bounds even the cheap generation paths.

**Contribution margin (per paying account):**
`price − (AI + voice + payment fees + amortized ops)`. FAMILY annual
(≈$130/yr ≈ $10.83/mo) over up to 4 learners must stay contribution-positive
even at the 120-min/learner voice cap; the cap is the lever that guarantees it.
→ **Action:** once live, instrument actual AI+voice cost per learner and revisit
the cap and price. Do NOT treat these model numbers as validated.

## 3. AI/voice cost governance (ties to 59_AI_MODEL_ROUTING_COST)

- Route cheap/simple requests to smaller models; reserve large models for tasks
  that need them (a routing concern, spec 59).
- Enforce `voiceMinutesPerLearnerPerMonth` server-side via the entitlements
  `getLimit` + a usage meter (new counter; not yet built — tracked as a gate in
  spec 47 §7 step 3).
- Every AI/voice call is attributable to a learner+plan so cost-per-plan is
  measurable, not guessed.

## 4. Funnel & conversion

```
Visitor → FREE signup → first-session journey (language→…→first reward)
        → 7-day FAMILY trial (full experience, voice on)
        → convert to FAMILY/EXPLORER  OR  fall back to FREE
```
- Activation metric: completed first mission with a real reward (now works —
  reward loop fixed, commit 48b3bde).
- Retention metric: daily-goal streak + weekly returning learners.
- Value proof to justify payment: visible mastery + portfolio + credentials
  (now surfaced — evidence portfolio, commit 2b9e92e).

## 5. Parent-value ↔ price mapping (mandate §35)

| Parent question | Where the product answers it |
| --- | --- |
| What does my child learn? | Balanced Development + mastery by domain |
| What did they make? | Portfolio (showcased projects) |
| Is it recognized? | Verifiable credentials (Open Badges) |
| Is it safe? | Consent/privacy (COPPA/GDPR) — live |
| Is it worth the price? | Full parent reports on paid tiers |

Every paid feature maps to a parent-visible outcome; that mapping is the
willingness-to-pay argument.

## 6. Risks / open questions

- **AI/voice cost variance** — biggest margin risk; mitigated by caps, must be
  measured. **Priority instrumentation.**
- **MENA willingness-to-pay** — local pricing/PPP needed; validate with a small
  price test before locking.
- **FREE too generous / too thin** — tune `missionsPerDay` and `worlds:sampler`
  from funnel data.
- **B2B sales motion** — SCHOOL needs a roster/admin surface (spec 50) before a
  real B2B push.

## 7. What this unblocks

With 47 + 48 defined, the implementation sequence (spec 67) can proceed:
seed plans → wire real gates via `hasFeature`/`getLimit` → build `/plans` +
upgrade UI → integrate a payment gateway. **No pricing UI ships before the plan
seed + gates exist** (mandate §36).
