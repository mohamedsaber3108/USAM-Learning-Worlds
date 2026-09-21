# 00 — USAM for Kids: Master Audit

Status: **Audit complete (Phases 2–3 of the mandate).** This is the factual
"what exists" baseline for the reconstruction. No implementation in this file.

Target repo/worktree: **`M:\USAM-main`**, branch **`fix/p0-p1-remediation`**
(the real, deployed line; shares history with `origin/main`, 0 behind / 33 ahead).

---

## A. Two-worktree hazard (root cause of prior confusion)

- `M:\USAM-main` — the REAL, rich, deployed app (58 pages, AppShell, i18n, admin). **Work here.**
- `M:\USAM Learning Worlds` — an OLD, ORPHANED copy (plain gray dashboard, ~15 routes, no shell). Its `main` branch has **no common ancestor** with `origin/main` — must never be pushed to origin.
- Sandboxed `grep_search`/`file_search` and relative reads resolve to the OLD copy. **Always use explicit `M:\USAM-main\...` paths.**

## B. Frontend inventory (verified)

- **58 page components** across **21 feature domains**: admin, analytics, auth, characters, coding, community, cosmetics, creativity, cross-curricular, dashboard, english, gamification, landing, learning, missions, onboarding, parents, projects, stories, thinking-skills, voice.
- **Routing** (`src/app/router/index.tsx`): public (`/login`, `/register`, `/` landing), onboarding wizard (5 steps, `ProtectedRoute`, no shell), authenticated app (all under one `<ProtectedRoute><AppShell/></ProtectedRoute>` parent with `<Outlet/>`), 16 admin routes (`AdminRoute`-gated). Heavy pages lazy-loaded.
- **Data layer**: `@tanstack/react-query`; per-page hand-written queryKeys; `src/lib/api/endpoints.ts` maps ~40 `*Api` objects to backend paths; `client.ts` axios with JWT + dual-token refresh interceptor.
- **Shell**: `AppShell` — desktop **floating pill nav** (rebuilt this session), mobile bottom tab bar + More drawer, role-gated admin/guardian links, `useAgeAdaptation`-driven density.
- **Design system**: token layer (warm `surface`, teal `primary`, amber `accent`, world hues, radii `card`/`control`/`blob`/`pill`, flat shadows), primitives `.card`/`.btn-*`/`.stat-card*`/`.world-tile`/`.card-playful`; UI kit `Button/Card/Badge/PageHeader/HeroHeader`; `CharacterFace` (15 bespoke SVGs, evolution stages) + `CharacterAvatar`; `CharacterState` (Loading/Empty/Error companions); `Skeleton`.
- **State**: no context — `localStorage` keys `accessToken`/`refreshToken`/`user` (+ `usam.language`). `useAgeAdaptation` reads `user.learner.ageBand` → density/vocabulary/card-count/copyTone.
- **i18n**: i18next en+ar, `usam.language` persisted, real RTL `<html dir>` mirroring applied at module load.

## C. Backend inventory (verified)

- NestJS + Prisma, global `api` prefix. **41 of 42 modules expose HTTP controllers** (only `english-learning` is engine-only, surfaced via `learning/english.controller.ts`). `ai` = 9 controllers, `learning` = 5, `problem-solving` = 3, `missions`/`projects` = 2 each.
- Controllers confirmed single-prefixed (`@Controller('learning')`, `@Controller('characters')`) → paths **match** frontend calls. **No contract bug** (the earlier "double-prefix" was from the old worktree).
- **Auth**: JWT access (15m) + refresh (7d, separate guard); login/register/me return `{ user:{id,email,role,learner,guardian}, accessToken, refreshToken }`; age band at `user.learner.ageBand`, set via `PATCH /auth/me/age-band`.
- **Key enums**: AgeBand `AGE_8_9|AGE_10_11|AGE_12_14`; MasteryState `NOT_STARTED|INTRODUCED|EXPLORING|PRACTICING|DEVELOPING|PROFICIENT|MASTERED`; MissionRunStatus `IN_PROGRESS|COMPLETED|ABANDONED`; ProjectState `DRAFT..SHOWCASED`; CosmeticCategory `BORDER|BADGE|TITLE|COLOR_THEME`; CharacterRole (14), ConversationType (8), LearningEventType (15+), EnglishStrandFamily (9), Role `LEARNER|GUARDIAN|MODERATOR|ADMIN`.

## D. Design references (24, all read)

Two libraries: `designs/` (14 — mostly adult/editorial: Apple, Linear, Ciridae,
Hyperstudio, Subframe, Increase, Wispr, Caldera, Dayos, SVZ, Agence Foudre,
Dylanbrouwer + kid-relevant MindMarket, Slush) and `kiddddds/` (10 — Duolingo,
Playdate, Playful, Aaply, MotherDuck, Zams, Karl). Convergent principles adopted:
flat depth via surface contrast + hairline borders; one strong accent; generous
radii; type hierarchy via scale; tactile pill controls; + kid layer: warm cream
canvas, character-led, big rounded cards, floating pill nav. See
`FRONTEND_DESIGN_LANGUAGE.md`.

## E. Honest problem statement (what "ugly/unprofessional" means, testable)

The app is **functionally comprehensive but visually/structurally uneven**. The
gap to "premium product" is presentation, not plumbing:
1. Individual page **layouts** vary in polish (some are card-grid dumps, some
   have branded heroes) — inconsistent rhythm/hierarchy.
2. The **home/dashboard** reads as a competent dashboard, not a "living learning
   world" (mandate §16).
3. **World/Mission/Project** flows exist but as generic cards, not the
   story→learn→practice→mastery journey (mandate §17–19).
4. Many backend engines (adaptive/recommendations, simulation, worlds,
   notifications, credentials, reflection) have **thin or no** dedicated frontend
   surface despite having controllers — feature-visibility gaps (mandate §13).

## F. Git state

`fix/p0-p1-remediation` = healthy, on real history, pushed (`abf49a9`). Local
`main` in the old worktree = orphaned, tagged `backend-fixes-orphan-main`, must
not be pushed.
