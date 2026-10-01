# 16 — PARENT JOURNEY

> The guardian is the buyer + monitor, involved by choice (01 §2). Merges prior
> Product Bible §7 parent loop + 48 parent-value↔price mapping. Backend: Guardian,
> Guardianship, ParentsController, ConsentRecord, DataSubjectRequest, Notification.

Date: 2026-09-30

---

## 1. Parent loop

```
Buy/trial (own Subscription) → create/link child (Guardianship, maxLearners)
 → see PROGRESS (mastery by domain) → see EVIDENCE (portfolio artifacts,
   credentials) → SAFETY/PRIVACY (consent, data requests, moderation visibility)
 → CONTROLS (time limits, approvals) → REPORTS (basic|full by plan)
```

## 2. What a parent must see (parent-truth — 14 §3)

| Question | Surface | Backend |
|---|---|---|
| What does my child learn? | mastery-by-domain + balanced development | MasteryRecord, domains |
| What did they make? | portfolio of real artifacts | Project/Portfolio |
| Is it recognized? | verifiable credentials (Open Badges) | Credential/CredentialDefinition |
| How is progress measured? | mastery states + evidence explained plainly | Evidence/MasteryState |
| Is it safe? | consent/privacy status, moderation, AI oversight | ConsentRecord, ModerationLog, SafetyEscalation |
| Is it worth the price? | parent reports (full on paid tiers) | parentReports feature flag |

## 3. Controls & safety (directive §9/§35)

- Time limits (`ParentsController` SetTimeLimits), content/approval controls
  (`Guardian.controls` JSON).
- Privacy: COPPA/GDPR consent (`ConsentRecord`), data export/delete
  (`DataSubjectRequest`) — the data-subject-rights path.
- AI oversight: parent can see character interactions (category expectation from
  05 §2 — Khanmigo-style chat visibility + safety alerts via Notification).

## 4. Purchasing rules (10 §5 / directive §25)

Parent owns the subscription; child never purchases. `maxLearners` gates how many
children under one guardian. Upgrade/downgrade/cancel via EntitlementsService.
Final real-payment price = owner-approval gated (11 §6).

## 5. Price ↔ outcome mapping (willingness-to-pay — 48 §5)

Every paid feature maps to a parent-visible outcome (AI tutor → faster help;
voice → speaking practice; credentials/export → recognized evidence; full reports
→ visibility). That mapping IS the pay argument.

## 6. Acceptance (maps to 46)

The 5 parent-truth checks pass for a real guardian walking buy→link→monitor→
safety→reports. Observed, not assumed.
