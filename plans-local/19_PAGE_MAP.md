# 19 — PAGE MAP (every required surface → backend → status)

> Every page the product needs, with its real backend dependency and current
> status in root `src/` (the likely rebuild target, 02 §A). Status: EXISTS(mock)
> = page exists but mock-backed; EXISTS(real) = wired to backend; NEW = to build.
> Routes shown are the TARGET structure (learner under `/app`-equivalent in the
> TanStack tree; current root `src/` uses flat routes — to reconcile in rebuild).

Date: 2026-09-30

---

## Public
| Page | Backend | Status |
|---|---|---|
| Landing | static | EXISTS(mock) `index.tsx` |
| How it works / For families / Safety | static | partial |
| Pricing | entitlements/plans (seeded) | NEW wiring |
| Login / Signup | auth | EXISTS |
| Verify credential | credentials | NEW |
| Onboarding (first-run, §15) | auth + diagnostic + preferences | EXISTS(mock) `onboarding.tsx` — rebuild to §15 flow |

## Learner
| Page | Backend | Status (root src/) |
|---|---|---|
| Home (living world) | adaptive/recommendations, dailyGoals, characters | EXISTS(mock) |
| Learn hub (4 domains) | learning/domains, worlds | EXISTS(mock) `learn.*`, `world.tsx` |
| Domain path | learning/domains/:slug/path | EXISTS(mock) `learn.$domainId` |
| English / Coding / AI / Entrepreneurship surfaces | english, coding, ai, cross-curricular | EXISTS(mock) `english.*`,`code.*`,`ai.*`,`venture.*` |
| Mission detail / player | missions, missions/runs | EXISTS(mock) `missions.*` |
| Practice (review/FSRS) | flashcards, mastery/review-due, adaptive | EXISTS(mock) `practice.tsx` |
| Progress (mastery/balanced) | mastery/overview, by-domain | EXISTS(mock) `progress.tsx` |
| Projects / detail | projects, rubrics | EXISTS(mock) `projects.tsx` |
| Portfolio | projects/evidence | EXISTS(mock) `portfolio.tsx` |
| Create / Creativity | creativity | EXISTS(mock) `create.*` |
| Companions (15 chars) | characters | EXISTS(mock) `characters.tsx` (10-name — reconcile to 15) |
| Stories | stories | EXISTS(mock) `stories.tsx` |
| Simulations | simulations | EXISTS(mock) `simulations.tsx` |
| Challenges / Boss | (challenges: adaptive; boss: NO model) | EXISTS(mock); confirm boss scope |
| Achievements / Rewards | gamification, cosmetics | EXISTS(mock) `achievements.tsx` |
| Credentials | credentials | NEW |
| Search / Notifications | search, notifications | NEW wiring |
| Profile / Settings | auth/me, preferences | EXISTS(mock) `profile.tsx` |
| Voice (woven) | voice | NEW wiring |

## Parent (GUARDIAN)
| Page | Backend | Status |
|---|---|---|
| Children / Child detail | parents, mastery, projects, safety | EXISTS(mock) `parents.tsx` — expand per §16 |
| Plan | entitlements | NEW |
| Privacy | legal (consent/data requests) | NEW |

## Moderator
| Console / Escalations / Community / Interventions | safety-escalations, community, interventions | NEW (backend exists) |

## Admin
| Overview / Content / Curriculum&QA / AI&Safety / Analytics / Platform | content-items, content-qa, curriculum-mapping, ai-eval, analytics, feature-flags, experiments, audit | NEW (backend exists) |

## Headline
Most learner pages EXIST but are MOCK-backed in root `src/`; parent/mod/admin are
thin or absent in root `src/` though the backend fully supports them. The rebuild
= wire real APIs + rebuild onboarding/home to §15 + reconcile characters to 15 +
build parent/mod/admin surfaces. (Confirm final route structure in 37.)
