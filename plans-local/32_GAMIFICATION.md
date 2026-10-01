# 32 — GAMIFICATION

> Motivation WITHOUT manipulation (06 R9, directive §31). Rewards ≠ mastery; no
> FOMO/guilt/toxic leaderboards. Backend: `gamification` (Progression/XP/Streak/
> Achievement logic), `cosmetics`, `daily-goals`, `StreakFreezePurchase`.

Date: 2026-09-30

---

## 1. Principle

Gamification runs ALONGSIDE learning, never gating it. XP/streaks/cosmetics
encourage return + effort; they are DECOUPLED from `MasteryState` (mastery is
evidence-driven, 30). A child advances by mastery, not by points.

## 2. Mechanics (backend-backed)

- XP + level (`Progression`, `XPGain`/`XPSource`) — motivational number only.
- Streaks + daily goals (`PracticeStreak`, `DailyGoal`) — habit cadence (05
  lesson from Duolingo) WITHOUT shame; streak-freeze (`StreakFreezePurchase`)
  removes guilt mechanics.
- Achievements — computed from `LearningEvent.ACHIEVEMENT_EARNED` + logic.
- Cosmetics/avatar (`AvatarCosmetic`, `LearnerCosmeticUnlock`) — earned
  self-expression (used in onboarding avatar creation, 15).

## 3. Age-adaptive visibility (age-presentation.ts)

`gamificationVisibility`: prominent (8–9) → supportive (10–11) → minimal
(12–14). `showStreaks`/`showPoints`: true/true → true/true → false/false. Older
learners see evidence/mastery, not points.

## 4. Anti-manipulation rules (hard)

No countdown-pressure FOMO; no guilt on streak loss (freeze exists); no toxic
competitive leaderboards (leaderboard opt-in only — `Learner.leaderboardOptIn`);
rewards never imply mastery. Reviewed as a design gate (46).

## 5. Status

Engine IMPLEMENTED (+ cosmetics seed). Frontend rewards/achievements MOCK-backed
→ wire. Verify achievements persistence (prior audit noted no Achievement
*entity* — recheck: logic computes from events; confirm storage approach in G5).
