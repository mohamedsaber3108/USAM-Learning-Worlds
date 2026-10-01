# 18 — NAVIGATION

> Concrete nav structure per role, age-adaptive. Feeds the page map (19) and the
> frontend shell (37). Target tree = root `src/` (pending owner tree confirm, 02 §A).

Date: 2026-09-30

---

## 1. Child shell nav (age-adaptive)

Primary (always, iconic): **Home · Learn · Practice · Create · Progress**.
Secondary (in shell / drawer by age): Companions · Rewards · Search ·
Notifications · Me (profile/settings). Voice = a persistent affordance (mic),
not a nav item. 8–9: bottom tab bar, ≤5 icons, large targets. 12–14: full nav.

## 2. Parent nav

Children · (Child detail tabs: Progress · Evidence · Activity · Safety · Controls)
· Plan · Privacy · Reports.

## 3. Moderator nav

Console (queue overview) · Escalations · Community · Interventions.

## 4. Admin nav (task-oriented areas, not one table)

Overview · Content · Curriculum & QA · AI & Safety · Analytics · Platform
(feature flags / experiments / audit).

## 5. Public nav

Logo · How it works · For families · Safety · Pricing · (Login / Start).

## 6. Rules

- Role determines the shell variant (one shell, role-param — not 4 shells).
- Every authenticated route guarded by role; honest 403 for wrong role; honest
  404 that renders for auth AND unauth (lesson from prior rebuild).
- Breadcrumb/back always available so a child can recover (child-truth #2).
- Nav labels i18n (EN/AR) + RTL via logical properties.
