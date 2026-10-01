# 34 — PARENT SYSTEM

> Implements the parent journey (16). Backend: `Guardian`, `Guardianship`,
> `parents` module (controller + SetTimeLimits), `legal` (consent/data requests),
> `notifications`, entitlements.

Date: 2026-09-30

---

## 1. Surfaces (16)

Children list · Child detail (Progress · Evidence · Activity · Safety · Controls)
· Plan (activate/cancel/upgrade) · Privacy (consent, export, delete) · Reports
(basic|full by plan).

## 2. Data sources

- Progress: `MasteryRecord` by domain (30).
- Evidence/made: `Project`/portfolio + `Credential` (33).
- Activity: `LearningEvent` summary (recent missions, weekly stats).
- Safety: `ModerationLog`, `SafetyEscalation`, character-interaction visibility.
- Controls: `Guardian.controls` JSON + `parents` SetTimeLimits.
- Plan: `entitlements` (10).

## 3. Controls & oversight

Time limits, content/approval controls, AI-interaction visibility (Khanmigo-style
parent inspectability — 05 §2 table stakes), safety alerts via `notifications`.

## 4. Privacy / data rights (35 / directive §9)

Consent (`ConsentRecord`), data export/delete (`DataSubjectRequest`) — COPPA/GDPR.
Parent is the data controller for the child's account.

## 5. Purchasing (10 §5)

Parent owns `Subscription`; child never buys; `maxLearners` gates children per
guardian. Final real-payment price owner-gated (11 §6).

## 6. Status

Backend EXISTS (parents/legal/notifications/entitlements). Frontend parent pages
thin/mock in root `src/` → rebuild per 16 with real data.
