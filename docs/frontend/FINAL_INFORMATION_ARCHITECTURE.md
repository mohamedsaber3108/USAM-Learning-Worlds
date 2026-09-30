# FINAL INFORMATION ARCHITECTURE + NAVIGATION

> Designed from zero, from the product model — NOT from the legacy nav. The
> platform must feel like ONE coherent ecosystem, not 100 disconnected apps and
> not a giant sidebar of every backend feature. Role-aware. Derived from
> `FINAL_ROLE_AND_JOURNEY_MAP` + `FINAL_PAGE_AND_FLOW_INVENTORY`.

## Global hierarchy

```
USAM
├── PUBLIC (pre-login ecosystem)
│   ├── Landing (what/who/how it connects/where to start)
│   ├── Pricing
│   ├── Credential verify (/verify/:uid)
│   └── Auth (login / signup)
├── ONBOARDING (guided, no nav chrome)
│   ├── Learner: language → welcome → age → interests → companion → done
│   └── Guardian: add child → consent
└── PLATFORM (post-login, role-aware app shell)
    ├── LEARNER  → learner shell
    ├── GUARDIAN → parent shell
    ├── MODERATOR → moderation console
    └── ADMIN → admin console
```

One `AppShell` with **role-variant navigation** (not one nav showing everything).
Onboarding and public deliberately sit OUTSIDE the shell (full-screen).

## Navigation models per role

### Public (top bar)
`USAM logo` · What is USAM · For families · Pricing · **Log in** · **Get started**
Minimal, identity-forward, ecosystem-explaining. Language toggle (EN/AR).

### Learner (primary nav = 5 anchors, mental-model driven)
Bottom tab bar on phone, side rail on desktop. Five anchors ONLY (avoid the
legacy's ~25 flat links):

1. **Home** (`/app`) — orient + resume + ONE next best action.
2. **Learn** (`/app/learn`) — worlds/domains → path → mission. Absorbs
   worlds/curriculum/concepts/paths/simulations/stories/english/coding/
   cross-curricular/thinking (legacy's ~15 learn routes → one Learn hub).
3. **Practice** (`/app/practice`) — "keep it strong": review-due + flashcards.
4. **Projects** (`/app/projects`) — projects + portfolio + creativity studio.
5. **Progress** (`/app/progress`) — mastery + evidence + insights + rewards.

Shell chrome (persistent, not tabs): companion presence, notifications,
search, profile/account menu (→ settings, credentials, language, logout).
Voice = contextual within Learn/companion, PROVIDER-GATED.

Rationale: the legacy scattered the learning loop across many sibling routes;
this groups by the child's mental model (Learn → Practice → Make → See progress)
so "where am I / what next" is always answerable.

### Guardian (parent nav)
`Children` (`/parent`) · per-child detail with tabs (Progress · Activity ·
Reflections · Safety · Controls) · `Plan` (`/parent/plan`) · `Privacy`
(`/parent/privacy`) · account. Read-mostly + controls. Strictly own children.

### Moderator (console nav)
`Overview` (`/mod`) · `Escalations` · `Community` · `Interventions`. Safety-first;
no consumer surfaces.

### Admin (console nav — task-oriented, NOT module-mirroring)
`Overview` (`/admin`) · `Content` (CMS: content items + missions authoring +
lifecycle) · `Curriculum` (mapping + QA + difficulty + misconceptions +
translations) · `AI & Safety` (prompt templates + safety policies + AI eval +
escalations view) · `Analytics` · `Platform` (flags + experiments + audit).
Six task areas absorb the legacy's 17 sibling admin pages.

## Cross-product relationships

- **The learning loop is the spine**: Home surfaces the next step → Learn hosts
  it → completing it feeds Practice (review) and Progress (mastery/evidence) →
  Projects is transfer. Every learner surface links forward to the next action.
- **Companion** is ambient across the learner shell (state reflects context),
  not a standalone destination only.
- **Guardian mirrors learner reality**: parent Progress/Activity reconcile with
  the child's real evidence/mastery (no divergent numbers).
- **Admin/Moderator** are separate shells; admin ⊃ moderator visibility.

## Navigation must answer (per role) — validation

For each role the nav answers: Where am I? What can I do? What's most important?
Where next? How back? How to switch context? How to find something (search)?
Every primary nav item maps to a real capability in the traceability matrix.

## Anti-patterns explicitly rejected (from legacy)

- ❌ ~25 flat learner links → ✅ 5 mental-model anchors + shell chrome.
- ❌ 17 sibling admin pages → ✅ 6 task areas.
- ❌ Every backend module as a top-level link → ✅ capabilities grouped by user
  intent (module ≠ nav item).
- ❌ Unknown route → silent `/dashboard` bounce → ✅ honest 404 + role-aware home.
- ❌ Landing = auth token branch → ✅ real ecosystem presentation.
- ❌ Parent routes with no client role gate → ✅ role+profile gated shells.
