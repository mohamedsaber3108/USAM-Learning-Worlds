# USAM Kids — Final Page & Flow Inventory (rebuild target)

> Reference Bible §33/§34/§35. The **final** page inventory derived from product
> requirements and journeys — NOT copied from current routes. Includes the
> old→new migration map so **no required feature or backend engine loses its
> surface** during the rebuild. Every page lists purpose, age/role, actions,
> backend deps, states, a11y.

Date: 2026-09-23 · HEAD `aa2cd67`

Column key: **State coverage** = which of loading/empty/error/offline must exist.
**Age** = primary band. **Rebuild** = NEW (build fresh) / REWORK (keep capability, redo IA/visual) / KEEP (already correct).

---

## PUBLIC (unauthenticated)
| Page | Purpose | Primary action | Backend deps | Rebuild |
| --- | --- | --- | --- | --- |
| Landing | What USAM is + value + CTA | Sign up | none | REWORK (world-first hero, not SaaS) |
| How it works / outcomes | Explain the learning journey + outcomes | Sign up | none | NEW |
| Safety / parents | Trust: safety, COPPA/GDPR, what parents get | Sign up / learn more | none | NEW |
| Pricing | Plans + value mapping | Choose plan → signup | `GET /entitlements/plans` (public) | REWORK (`/plans` exists) |
| Login / Signup | Auth | Submit | `/auth/login|register` | KEEP (works; restyle to system) |

## CHILD (authenticated learner)
| Page | Purpose | Age | Primary action | Backend deps | States | Rebuild |
| --- | --- | --- | --- | --- | --- | --- |
| Onboarding: language | Pick EN/AR + RTL | all | continue | — | — | KEEP |
| Onboarding: welcome | Meet companion | all | continue | characters | loading | REWORK |
| Onboarding: diagnostic/age | Estimate learner (age + light skill probe) | all | continue | `PATCH /auth/me/age-band`; (NEW) diagnostic | loading/error | REWORK→NEW (add skill probe) |
| Onboarding: interests | Interest chips → learner model | all | continue | `PATCH /auth/me/preferences` | — | KEEP |
| Onboarding: character | Choose companion | all | finish | characters | loading | REWORK |
| **Home (living world)** | Orientation + ONE next action + world map + companion | all (age-adaptive) | resume/next mission | recommendations, gamification, mastery, worlds, missions history | loading/empty/error | **REWORK → world-map home** |
| World map | Explore worlds, see unlock/progress | all | enter world | `GET /worlds`, mastery | loading/empty/error | REWORK (strip → full map) |
| World detail | Missions within a world | all | start mission | worlds, missions | loading/empty/error | NEW |
| Missions browse | Find missions (older bands) | 10–15 | open mission | `GET /missions` | loading/empty/error | KEEP/REWORK |
| Mission detail | Intro + start | all | start | `GET /missions/:id` | loading/error | REWORK |
| **Mission player** | Story→Learn→Practice→Reward | all | submit activity | missions run/submit, coding-sandbox, coding-coach | loading/error | KEEP (recently rebuilt) |
| Mission complete | Reward, XP, pass, reflection | all | continue | complete outcome, reflection | — | KEEP (recently fixed) |
| Practice | Retrieval/spaced practice, flashcards | all | answer | flashcards (FSRS), questions | loading/empty | REWORK |
| Learn / curriculum | Browse concepts/paths | 10–15 | open concept | learning, curriculum | loading/empty/error | REWORK |
| English | English sub-engines | all | start activity | english, english-coach | loading/error | REWORK |
| Coding | Coding missions + sandbox | 10–15 | run code | coding-sandbox, coding-coach, blockly | loading/error | REWORK |
| AI learning | AI-literacy concepts/projects | 12–15 | start | ai-literacy content | loading/empty | NEW |
| Creativity / future-skills | Creative prompts, thinking, cross-curricular | all | submit | creativity, thinking, cross-curricular | loading/empty | REWORK |
| Simulations | Branching decision scenarios | 10–15 | play | simulations | loading/empty/error | KEEP |
| Stories | Illustrated stories | 7–12 | read | stories | loading/empty | REWORK |
| Projects | PBL list | all | new project | projects | loading/empty | REWORK |
| Project workspace | Build a project | all | save/showcase | projects, media | loading/error/offline | NEW (deeper workspace) |
| Characters | Companion gallery + chat | all | chat (paid) | characters, `/characters/:id/chat` | loading/empty | REWORK |
| Voice | Voice interaction w/ companion | all | talk (paid) | `/voice/turn` + sidecars | loading/error/offline | KEEP (gated) |
| Challenges | Timed/challenge missions | 10–15 | start | missions (CHALLENGE) | loading/empty | NEW |
| Progress / mastery | See growth | all | drill in | mastery, progression | loading/empty/error | REWORK |
| Balanced development | Balanced-growth view | all | — | `/mastery/by-domain` | loading/empty/error | KEEP |
| Achievements | Badges + credentials | all | verify credential | gamification, credentials | loading/empty | REWORK |
| Portfolio | Evidence: mastery+credentials+projects | all/parent | — | mastery, credentials, projects | loading/empty | KEEP (recently built) |
| Search/discovery | Find content | 10–15 | open result | search | loading/empty | REWORK |
| Notifications | In-app notices | all | open | notifications | loading/empty | KEEP |
| Profile/settings | Language, interests, age, cosmetics | all | save | auth/me, cosmetics | loading/error | REWORK |
| Shop (cosmetics) | Earned customization | all | equip | cosmetics | loading/empty | KEEP |
| Leaderboard | Opt-in ranking | 10–15 | — | gamification | loading/empty | KEEP |
| Plans | Compare/upgrade | parent-facing | subscribe | entitlements | loading/error | KEEP |

## PARENT (authenticated guardian)
| Page | Purpose | Primary action | Backend deps | Rebuild |
| --- | --- | --- | --- | --- |
| Parent onboarding/account | Set up guardian | continue | auth, guardianship | NEW/REWORK |
| Child linking/management | Link/manage children | add child | parents, guardianship | REWORK |
| Parent dashboard | Family + per-child overview | drill in | parents, mastery | REWORK |
| Progress/mastery (parent view) | Child growth evidence | — | mastery, progression | REWORK |
| Projects/portfolio (parent view) | See child's work | — | projects, credentials | REWORK |
| Weekly reports | Digest of progress | — | analytics/learning-events | NEW |
| Safety/privacy/consent | COPPA/GDPR consent, export/delete | manage consent | legal | KEEP |
| Time limits | Screen-time controls | set limits | parents | KEEP |
| Notifications | Parent notices | open | notifications | REWORK |
| Subscription/billing | Manage plan | change plan | entitlements | REWORK (`/plans`) |
| Settings | Account settings | save | auth | REWORK |

## ADMIN / INTERNAL (not learner/parent facing — keep separate)
Content/curriculum tools, moderation/safety, user support, analytics, feature flags,
AI policy/prompt tools, audit logs. → existing `/admin/*` pages; **KEEP** (out of
scope for the child-experience rebuild; restyle only if trivial).

---

## Migration / deletion map (old → new) — zero feature loss (§35)
Every current route maps to a rebuilt surface or is consciously retired. No backend
engine is orphaned (cross-check `plans-local/66_FINAL_ENGINE_INVENTORY.md`).

| Current route | Disposition | New home |
| --- | --- | --- |
| `/dashboard` | REWORK | Home (living world) |
| `/worlds` | REWORK | World map + World detail |
| `/missions*`, `/missions/play/:runId`, `/missions/complete` | KEEP | Mission flow (recently rebuilt) |
| `/learn*`, `/learn/flashcards`, `/learn/visual-language` | REWORK | Learn + Practice |
| `/english`, `/english/coach` | REWORK | English |
| `/creativity`, `/thinking/:engine`, `/cross-curricular/:category` | REWORK | Creativity / future-skills |
| `/simulations*` | KEEP | Simulations |
| `/stories*` | REWORK | Stories |
| `/projects*` | REWORK | Projects + Project workspace |
| `/portfolio` | KEEP | Portfolio |
| `/balanced` | KEEP | Balanced development |
| `/progress`, `/insights` | REWORK/MERGE | Progress/mastery (merge insights timeline in) |
| `/achievements` | REWORK | Achievements |
| `/characters`, `/characters/:id/chat` | REWORK | Characters |
| `/voice-chat` | KEEP | Voice |
| `/community` | REWORK/EVALUATE | Community (verify child-safety model before prominence) |
| `/shop`, `/leaderboard` | KEEP | Shop / Leaderboard |
| `/plans` | KEEP | Plans |
| `/parents*` | REWORK | Parent area |
| `/admin/*` | KEEP | Admin (separate) |
| — (missing) | NEW | How-it-works, Safety/parents, World detail, AI learning, Challenges, Project workspace, Weekly reports, Parent onboarding |

## Navigation architecture (rebuild)
- **Child nav is age-adaptive:** 7–9 = iconic bottom bar (Home · Learn · Play · Me) + voice; 10–12 adds Worlds/Projects; 13–15 gets fuller nav + search. Driven by `useAgeAdaptation`.
- **Parent nav is distinct** (dashboard-oriented, text-ok).
- Every important engine is reachable in ≤2 taps for its band. No dead entries.

## Flows (must all be coherent + tested — §36 truth table)
1. Visitor → landing → signup → onboarding (lang→diagnostic→interests→character) → Home.
2. Home → recommendation → mission (Story→Learn→Practice) → reward → next.
3. Coding mission → sandbox → Ask-the-Coach → submit → project → portfolio.
4. English → activity → (voice) → assessment → mastery → review.
5. Parent → link child → dashboard → progress/evidence → consent/controls.
6. Gate hit → `/plans` → subscribe → entitlement → access.

---

## Router reconciliation (post-reconciliation phase, HEAD `1ea9ff0`)

Reconciled against the REAL router `frontend/src/app/router/index.tsx` (44 routes).
See `plans-local/76_FRONTEND_ENGINE_COVERAGE.md` for the full per-route
classification. This section resolves "phantom documented pages" vs
"undocumented production routes".

### Routes that exist and are FINAL (present in router)
All KEEP/REWORK rows above are routed and shipped, plus these routes added during
the reconciliation phase (were NOT in the original rebuild-target tables — now
documented here):

| Route | Surface | Notes |
| --- | --- | --- |
| `/practice` | Practice / Review center | Consumes `masteryApi.getReviewDue` (previously zero consumers) + adaptive recs. |
| `/evidence` | "What I have proved" | Child accomplishments from `masteryApi.getOverview` (demonstrated competencies). |
| `/learning/domains/:slug/path` | Generic domain path | Shared canonical-spine path for english/coding/ai-literacy/creativity. |

### Documented-but-NOT-routed (deliberately future, NOT phantom bugs)
These appear in the tables above as **NEW** (future scope), and correctly have no
route yet. They are tracked here so nobody mistakes them for regressions:

- Public: **How-it-works**, **Safety/parents** marketing pages.
- Child: **Challenges** (dedicated route — CHALLENGE missions are reachable via
  `/missions` today), **Search/discovery**, **Notifications**, **Profile/settings**.
- Parent: **Parent onboarding/account**, **Weekly reports**.

None are required for the current engine-coverage bar; they are net-new product
surfaces. When built they must go in `frontend/src/features/*/pages` + the
canonical router and be added to the FINAL table above.

### Undocumented production routes
**None.** Every route in the router maps to a table row above or to the three
reconciliation-phase additions listed here. No orphan/phantom routes.

### Verdict
- No phantom documented **routes** (the unbuilt items are explicitly NEW/future).
- No undocumented production routes.
- Inventory ↔ router are reconciled.
