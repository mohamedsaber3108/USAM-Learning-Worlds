# 17 — INFORMATION ARCHITECTURE

> How the product is organized per role, age-adaptive. Grounds navigation (18),
> page map (19), feature map (20). Based on the locked 4-domain scope + verified
> backend surfaces.

Date: 2026-09-30

---

## 1. Top-level IA by role

- **Child (LEARNER):** Home (living world) · Learn (4 domains → worlds →
  missions) · Practice (review/FSRS) · Create (projects/creativity) · Progress
  (mastery/portfolio/credentials) · Companions (characters) · Me (profile/
  settings/rewards). Voice is woven across, not a separate silo.
- **Parent (GUARDIAN):** Children · Child detail (progress/evidence/activity/
  safety/controls) · Plan · Privacy · Reports.
- **Moderator:** Console · Escalations · Community · Interventions.
- **Admin:** Overview · Content · Curriculum/QA · AI & Safety · Analytics ·
  Platform (flags/experiments/audit).
- **Public:** Landing · How it works · For families · Safety · Pricing · Legal ·
  Login/Signup · Verify credential.

## 2. The 4 domains are the spine of "Learn"

Learn → [English · Coding · AI · Entrepreneurship] → World(s) per domain →
Missions → Mission player. Supporting competencies surface inside missions +
a "Balanced Development" view, NOT as top-level peers to the 4 domains.

## 3. Age-adaptive IA depth (07 §2)

- 8–9: 1-level, iconic nav; fewer visible choices (`maxVisibleCards` low);
  voice-forward; Home strongly Azouz-led.
- 10–11: 2-level nav; more surfaces visible.
- 12–14: full nav depth; self-directed access to all surfaces.
Same IA, depth revealed by band via `useAgeAdaptation`.

## 4. Cross-cutting surfaces

Search, Notifications (unread), Companion access, and Voice are reachable from
the shell at every age (depth-adapted). Every surface answers "what's next".

## 5. Anti-patterns to avoid (from directives)

- No giant admin table as the whole admin product (task-oriented areas instead).
- Moderator ≠ admin clone.
- No dead-end screens for the child.
- Domains ≠ a generic subject grid; it's a world you enter.
