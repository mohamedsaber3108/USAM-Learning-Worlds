# USAM Kids — Product Audit for the USAM Master Ecosystem Landing Page

> Read-only audit of the **USAM Kids** product (this repository) intended to feed
> the future **USAM Master Landing Page**. Nothing in the product was modified to
> produce this report. Every claim is grounded in the actual codebase; anything
> not yet built is explicitly under **RECOMMENDATIONS**.
>
> Repo: `USAM-Learning-Worlds` · Branch audited: `fix/p0-p1-remediation` · Date: 2026-09-23

---

## 1. Project Overview

| Field | Value |
| --- | --- |
| **Project name** | USAM Kids (repo: `USAM-Learning-Worlds`) — "USAM Learning Worlds" |
| **Product purpose** | AI-native, child-first learning platform for ages 7–15: English, coding, AI literacy, and cross-cutting skills through adaptive missions, projects, and characters |
| **Production URL** | `https://kids.usamif.com` (frontend), API at `https://kids.usamif.com/api` |
| **Credential base URL** | `https://usamlearning.com/credentials` (public Open-Badge verification) |
| **Frontend stack** | React 18 + TypeScript + Vite 5, Tailwind CSS, React Router 6, TanStack Query 5, Zustand, react-hook-form + zod, framer-motion, i18next/react-i18next (EN + AR, RTL) |
| **Backend stack** | NestJS 10 + TypeScript, Prisma 5, PostgreSQL (+ pgvector), Redis/BullMQ (queues), Passport JWT |
| **In-browser code execution** | Pyodide (Python), Sandpack (JS/React), Blockly (visual) — for coding missions |
| **Database** | PostgreSQL with `pgvector` (concept embeddings); ~90 Prisma models |
| **Authentication** | JWT (access + refresh) via `@nestjs/jwt` + Passport; bcryptjs password hashing; tokens in `localStorage` (`accessToken`, `refreshToken`, `user`) |
| **AI integration** | AWS Bedrock (`@aws-sdk/client-bedrock`, `client-bedrock-runtime`); local embeddings via `@xenova/transformers`; spaced-repetition via `ts-fsrs` |
| **Storage** | AWS S3 (`@aws-sdk/client-s3`, presigned URLs) |
| **Observability** | OpenTelemetry (OTLP HTTP exporter), Pino logging |
| **Rate limiting / security** | `@nestjs/throttler`, `helmet`, `compression` |
| **Deployment** | Single EC2 (Ubuntu) host; frontend built to static `dist/` served by **nginx**; backend run under **PM2** (`usam-backend`); PostgreSQL + Redis local; DB migrations are **raw SQL applied manually via psql** (no Prisma migration history table) |
| **Environment structure** | `frontend/.env` (`VITE_API_URL`), `backend/.env` (`DATABASE_URL`, `FRONTEND_URL`, Bedrock/S3 creds). Local dev: Vite `:5173`, API `:3001` |
| **Deploy verification** | `scripts/verify-deployment.sh` (checks live bundle hash == build, plus critical routes) |

### Shared with other USAM products (candidates)
- **Brand domain**: `usamif.com` (Kids on `kids.` subdomain) and `usamlearning.com` (credentials). These imply a shared USAM brand umbrella.
- **Credential/Open-Badges issuer** (`usamlearning.com/credentials`) is verification-portable and could be shared across USAM products.
- **Auth model** (JWT + role enum with `LEARNER`/`GUARDIAN`/`ADMIN`) is a natural shared-identity candidate but is **currently self-contained** to Kids. No shared SSO/identity provider exists in this repo yet.

---

## 2. Complete Page Inventory

All routes live in `frontend/src/app/router/index.tsx`. Auth is enforced by a `ProtectedRoute` wrapper; onboarding routes redirect learners lacking an `ageBand`.

### Public routes
| Path | Page | Purpose | Status | Expose from Master? |
| --- | --- | --- | --- | --- |
| `/` | Landing | Marketing entry: hero + character, how-it-works, worlds, balanced-development, parent/safety, dual CTAs. EN+AR | Implemented | **Yes** (this is the redirect target) |
| `/login` | Login | Email/password sign-in | Implemented | Yes (deep link) |
| `/register` | Register | Account creation | Implemented | Yes (deep link) |

### Onboarding (authenticated, first-run)
| Path | Page | Purpose | Status |
| --- | --- | --- | --- |
| `/onboarding/language` | Language pick | EN/AR + RTL | Implemented |
| `/onboarding/welcome` | Welcome | Intro w/ companion | Implemented |
| `/onboarding/age` | Age band | Sets `AgeBand` (7–9 / 10–12 / 13–15) | Implemented |
| `/onboarding/interests` | Interests | Interest chips → `PATCH /auth/me/preferences` | Implemented |
| `/onboarding/character` | Character pick | Choose companion | Implemented |
| `/onboarding/complete` | Complete | Generates learner model, routes to dashboard | Implemented |

### Learner app (authenticated)
| Path | Page | Purpose | Status |
| --- | --- | --- | --- |
| `/dashboard` | Home | XP/level/streak, daily goal, recommendations, interest chips, World Journey strip, companion, quick actions | Implemented |
| `/worlds` | Worlds map | Six-worlds map, unlock state, mission counts | Implemented |
| `/missions` | Missions browse | Filter/search missions | Implemented |
| `/missions/:id` | Mission detail | Intro + start | Implemented |
| `/missions/play/:runId` | Mission player | Story→**Learn**→Practice loop, activity types, companion | Implemented |
| `/missions/complete` | Reward | Score, XP, pass/level-up, reflection check | Implemented |
| `/learn` | Curriculum browse | Concepts by domain | Implemented |
| `/learn/concepts/:id` | Concept detail | Concept view | Implemented |
| `/learn/paths` · `/learn/paths/:id` | Learning paths | Path list + detail | Implemented |
| `/learn/flashcards` | Flashcards | FSRS spaced-repetition study | Implemented |
| `/learn/visual-language` | Visual language | Visual-language cards | Implemented |
| `/english` · `/english/coach` | English engine + coach | English learning + AI coach | Implemented (coach AI-gated) |
| `/creativity` | Creativity | Creative prompts | Implemented |
| `/thinking/:engine` · `/:engine/:slug` | Thinking skills | Critical thinking / problem solving / computational thinking | Implemented |
| `/cross-curricular/:category` · `/:slug` | Cross-curricular | Cross-domain content | Implemented |
| `/simulations` · `/simulations/:slug` | Simulations | Branching decision scenarios (entrepreneurship, finance, digital safety, science, civic) | Implemented |
| `/stories` · `/stories/:id` | Stories | Story engine | Implemented |
| `/projects` · `/projects/:id` | Projects | Project-based learning | Implemented |
| `/portfolio` | My Portfolio | Evidence portfolio: mastery + credentials + showcased projects | Implemented |
| `/balanced` | Balanced Development | Mastery by domain, balanced-growth view | Implemented |
| `/progress` | Progress | Progress tracking | Implemented |
| `/insights` | My Journey | Activity timeline/patterns | Implemented |
| `/achievements` | Achievements | Badges + verifiable credentials | Implemented |
| `/leaderboard` | Leaderboard | Ranking (opt-in) | Implemented |
| `/characters` · `/characters/:id/chat` | Character gallery + chat | Meet + chat with characters (chat AI-gated) | Implemented (AI-gated) |
| `/voice-chat` | Voice chat | Realtime voice with companion | Implemented (voice-gated + Bedrock/sidecar dependent) |
| `/community` | Community | Feed of showcased work | Implemented |
| `/shop` | Cosmetic shop | Avatar cosmetics (earned) | Implemented |
| `/plans` | Plans / pricing | Compare plans, upgrade (Entitlements engine) | Implemented |

### Parent routes (authenticated, guardian)
| Path | Page | Purpose | Status |
| --- | --- | --- | --- |
| `/parents` | Parent dashboard | Family overview, child progress | Implemented |
| `/parents/children/:learnerId/privacy` | Privacy/consent | COPPA/GDPR consent, data export/delete | Implemented |
| `/parents/children/:learnerId/time-limits` | Time limits | Screen-time controls | Implemented |

### Admin / internal routes (authenticated, admin — **do NOT expose from Master**)
`/admin/ai-eval`, `/admin/analytics`, `/admin/assessment-quality`, `/admin/audit-log`, `/admin/content-items`, `/admin/content-qa`, `/admin/experiments`, `/admin/feature-flags`, `/admin/interventions`, `/admin/memory-governance`, `/admin/misconceptions`, `/admin/missions`, `/admin/prompt-templates`, `/admin/question-templates`, `/admin/safety-escalations`, `/admin/safety-policies`.

`*` → NotFound.

---

## 3. Feature Inventory

| Feature | What it does | Where | Access | Main route | Status |
| --- | --- | --- | --- | --- | --- |
| **Adaptive recommendations** | "What next" from real mastery/interest signals | Home | Learner | `/dashboard` | Implemented |
| **Missions** (story→learn→practice→reward) | Guided learning units with teaching step, practice activities, scored reward, XP | Missions | Learner | `/missions` | Implemented |
| **Mastery tracking** | Confidence-based mastery per competency, spaced review | Balanced / Progress | Learner | `/balanced`, `/progress` | Implemented |
| **Worlds** | Six-worlds map w/ unlock progression | Worlds | Learner | `/worlds` | Implemented |
| **Coding sandbox** | In-browser Python (Pyodide), JS/React (Sandpack), visual (Blockly) execution + grading | Mission player | Learner | `/missions/play/:runId` | Implemented |
| **Coding Coach (AI)** | Explain / debug help on the learner's code | Mission player (panel) | Paid learner | `/missions/play/:runId` | **UI built; AI (Bedrock) unverified** |
| **English engine + AI coach** | Vocabulary→reading→grammar→conversation; AI conversation/grammar/pronunciation | English | Learner (coach paid) | `/english`, `/english/coach` | Implemented (coach AI-gated) |
| **Simulations** | Branching decision scenarios | Simulations | Learner | `/simulations` | Implemented |
| **Stories** | Illustrated multi-page stories | Stories | Learner | `/stories` | Implemented |
| **Creativity prompts** | Open-ended creative submissions + gallery | Creativity | Learner | `/creativity` | Implemented |
| **Thinking skills / cross-curricular** | Critical thinking, problem solving, computational thinking, cross-domain | Thinking / Cross-curricular | Learner | `/thinking/:engine` | Implemented |
| **Projects (PBL)** | Project creation, milestones, collaborators, showcase | Projects | Learner | `/projects` | Implemented |
| **Portfolio / evidence** | Aggregates mastery + credentials + showcased projects | Portfolio | Learner/Parent | `/portfolio` | Implemented |
| **Credentials (Open Badges)** | Verifiable achievement credentials | Achievements / Portfolio | Learner | `/achievements` | Implemented |
| **Gamification** | XP, levels, streaks, daily goals, leaderboard, cosmetics | Home / Shop / Leaderboard | Learner | `/dashboard`, `/shop`, `/leaderboard` | Implemented |
| **Flashcards (FSRS)** | Spaced-repetition study | Learn | Learner | `/learn/flashcards` | Implemented |
| **Characters** | Companion gallery + AI chat | Characters | Learner (chat paid) | `/characters` | Implemented (chat AI-gated) |
| **Voice chat** | Realtime STT→AI→TTS with companion | Voice | Paid learner | `/voice-chat` | Built; needs Bedrock + ASR/TTS sidecars |
| **Reflection (metacognition)** | Post-mission self-reflection check | Mission complete | Learner | `/missions/complete` | Implemented |
| **Search** | Search bar over content | Global | Learner | (nav) | Implemented |
| **Notifications** | Bell + milestone notifications | Global | Learner | (nav) | Implemented |
| **Onboarding** | Language→age→interests→character→learner model | Onboarding | New learner | `/onboarding/*` | Implemented |
| **Community feed** | Showcased projects feed | Community | Learner | `/community` | Implemented |
| **Parent dashboard** | Family/child progress overview | Parents | Guardian | `/parents` | Implemented |
| **Privacy / consent (COPPA/GDPR)** | Consent purposes, data export/delete | Parents | Guardian | `/parents/children/:id/privacy` | Implemented |
| **Time limits** | Screen-time controls | Parents | Guardian | `/parents/children/:id/time-limits` | Implemented |
| **Plans / subscriptions / entitlements** | 4 plans, feature gates (missionsPerDay/voice/aiTutor/maxLearners), subscribe/cancel | Plans | Guardian | `/plans` | Implemented (payment gateway = manual/no real processor yet) |
| **Settings / preferences** | Language, interests, age band | Onboarding/account | Learner | `PATCH /auth/me/*` | Implemented |
| **Uploads / media** | S3-backed media assets | Backend | System | `/media` | Implemented (infra) |

---

## 4. User Types / Roles

Role enum (`Role`): observed values include **LEARNER**, **GUARDIAN**, **ADMIN** (plus supporting states). Learner age is modeled via `AgeBand`: `AGE_8_9`, `AGE_10_11`, `AGE_12_14` (product-facing bands 7–9 / 10–12 / 13–15).

| Role | Entry point | Onboarding | Dashboard | Key features | Notes |
| --- | --- | --- | --- | --- | --- |
| **Learner (child)** | `/register` → `/onboarding/*` | Language→age→interests→character | `/dashboard` | Missions, worlds, coding, English, projects, portfolio, characters, gamification | Age-adaptive UI density/tone via `useAgeAdaptation` |
| **Guardian (parent)** | `/register` (guardian) / `/parents` | Guardian account | `/parents` | Child progress, privacy/consent, time limits, plans/billing | Owns the subscription/entitlements |
| **Admin** | `/admin/*` | — | Admin CMS pages | Content, safety, experiments, flags, AI ops | Internal only — **not** for Master Page |

---

## 5. User Journeys (as implemented)

**New learner onboarding**
`/` (landing) → Register → `/onboarding/language` → `/welcome` → `/age` → `/interests` (→ `PATCH /auth/me/preferences`) → `/character` → `/complete` → `/dashboard`.

**Core learning loop**
`/dashboard` (recommendation) → `/missions/:id` → Start → `/missions/play/:runId` → **Learn** step → Practice activities (`POST /missions/runs/:runId/submit`) → Complete (`/complete`) → XP + reflection → back to recommendation. FREE learners capped at 3 missions/day.

**Coding mission**
Mission player → Code activity (Pyodide/Sandpack/Blockly) → run + grade (`/coding-sandbox/submissions`) → optional **Ask the Coach** (explain/debug, paid) → advance.

**Evidence / parent value**
Learner completes work → mastery updates → credentials issued → `/portfolio` aggregates mastery + credentials + showcased projects; guardian reviews via `/parents`.

**Upgrade**
Learner/guardian hits a gate (e.g. mission cap, voice, AI chat) → prompted → `/plans` → subscribe (`POST /entitlements/subscribe`; manual provider activates immediately).

**Parent safety**
Guardian → `/parents/children/:id/privacy` → set consent purposes / export / delete data (COPPA/GDPR).

---

## 6. Navigation Audit

Primary navigation is a floating pill nav + a "More" drawer in `frontend/src/components/layout/AppShell.tsx`.

**Primary nav (bottom bar / pill):** Home (`/dashboard`), Learn/Missions, Community (`/community`), Profile→Parents (`/parents`), plus a "More" entry.

**More drawer:** Worlds (`/worlds`), Simulations (`/simulations`), Shop (`/shop`), My Journey (`/insights`), My Portfolio (`/portfolio`), Achievements (`/achievements`), Leaderboard (`/leaderboard`), Progress (`/progress`), Balanced (`/balanced`), Voice Chat (`/voice-chat`), Characters (`/characters`), **Plans (`/plans`)**, Time Limits (`/parents`).

**Utilities:** logo → `/dashboard`, notification bell, search bar, language toggle (EN/AR + RTL).

**Skip link:** WCAG 2.4.1 skip-to-content link → `#main-content`.

Assessment: all listed destinations are real, implemented routes. No dead nav entries detected. The nav is Kids-internal; it does **not** reference other USAM products (expected — that's the Master Page's job).

---

## 7. Design System Audit

Source of truth: `frontend/tailwind.config.js` (tokens) and `frontend/src/styles/index.css` (component classes like `.btn-*`, `.card`, `.icon-chip`, `.rounded-*`, `brand-hero`).

### Colors (exact, from `tailwind.config.js`)
- **Primary — deep teal** (dominant brand): `50 #eef5f3 · 100 #d4e7e2 · 200 #a9cfc6 · 300 #75b0a3 · 400 #458d7e · 500 #2b7061 · 600 #1c5a4d · 700 #12403a · 800 #0d3330 · 900 #0a2926`
- **Accent — warm amber/terracotta** (sparing CTAs/streaks): `50 #fdf3ec … 500 #d96a2c … 900 #652f1b`
- **Secondary — honey gold** (XP/rewards): `50 #fdf8ec … 500 #cf9316 … 900 #623d16`
- **Success — emerald** (correct/mastery): `50 #ecfdf5 … 500 #10b981 …`
- **Warning, Error, Surface** (canvas/neutrals), plus playful **sky / grape / bubble** accent scales.
- **Brand hero gradient:** `brand-hero = linear-gradient(135deg, #12403a 0%, #1c5a4d 45%, #2b7061 100%)`

### Typography
- **Display/Heading font:** **Nunito** (fallback Manrope) — warm rounded sans.
- Weights up to extrabold for display; body uses the same family. Buttons/labels use semibold/bold.

### Components (reusable, defined in `styles/index.css` + `src/components`)
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-outline`, `.btn-hero`, `.btn-hero-accent` (no `btn-ghost`).
- `.card`, `.icon-chip`, rounded tokens (`rounded-pill`, `rounded-card`, `rounded-blob`, `rounded-control`).
- Shared components under `frontend/src/components/`: `common/CharacterState` (Loading/Empty/Error states with a companion), `common/Skeleton`, `celebrations/CelebrationOverlay`, `layout/AppShell`, `ui/Button`, `layout/NotificationBell`, `layout/SearchBar`, `layout/LanguageToggle`.
- Character components: `features/characters/components/CharacterFace`, `CharacterAvatar`; visuals map in `features/characters/lib/characterVisuals.ts`.

### Visual language
- Rounded, tactile ("pill") buttons; flat soft shadows (`shadow-soft`, `shadow-lift`, `shadow-glow-success/error`); warm surface canvas; decorative `dots-layer`; framer-motion micro-interactions (tap scale, spring, page transitions); RTL mirroring via `rtl:` variants keyed off `<html dir>`. Icons from **lucide-react**.

---

## 8. Brand Assets

| Asset | Path |
| --- | --- |
| USAM logo (app) | `frontend/src/assets/usam-logo.png` |
| USAM logo (public/favicon source) | `frontend/public/usam-logo.png` |
| Character system (visual identities: color, name, blurb, role) | `frontend/src/features/characters/lib/characterVisuals.ts` |
| Character face/avatar renderers | `frontend/src/features/characters/components/CharacterFace.tsx`, `CharacterAvatar.tsx` |

> Note: characters are rendered programmatically (color + face component), not stored as individual image files. No Lottie/SVG illustration library or separate favicon set was found beyond `usam-logo.png`. Fonts are loaded as web fonts (Nunito), not vendored files.

---

## 9. AI Features

All AI is backed by **AWS Bedrock** (`backend/src/modules/ai`), with local embeddings (`@xenova/transformers`) and FSRS scheduling. **Verification note:** AI endpoints require live Bedrock credentials and could not be exercised end-to-end during this audit — statuses reflect code presence, not a live model call.

| AI feature | Type | Purpose | Entry point | Backend endpoint | Provider | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **Character chat** | Assistant/guide | Talk to a companion character | `/characters/:id/chat` | `POST /characters/:id/chat` | Bedrock | Built; **gated to paid plans** (`aiTutor`); AI unverified |
| **Coding Coach** | Assistant | Explain / debug learner code | Mission player panel | `POST /coding-coach/{debug,explain,review,challenge}` | Bedrock | UI built (this audit); AI unverified |
| **English Coach** | Assistant | Conversation, grammar, pronunciation, vocabulary, reading | `/english/coach` | `POST /english-coach/*` | Bedrock | Built; AI unverified |
| **AI feedback / hint / explain** | Generation | Activity feedback, hints, explanations | within activities | `POST /ai/{feedback,hint,explain,analyze}` | Bedrock | Built; AI unverified |
| **Adaptive recommendations** | Recommendation engine | "What next" from mastery + interests | Home | `GET /adaptive/recommendations` | Rule/data-driven (not LLM) | Implemented + live |
| **Mastery / difficulty / misconception / intervention** | ML/analytics engines | Confidence, calibration, remediation | internal | `mastery`, `difficulty-calibration`, `misconceptions`, `interventions` | data-driven | Implemented |
| **Voice pipeline** | Assistant (voice) | STT → AI → TTS realtime | `/voice-chat` | `POST /voice/turn` | Bedrock + ASR/TTS Python sidecars | Built; **gated (`voice`)**; needs sidecars + Bedrock |
| **Moderation** | Automation/safety | Content moderation | internal | `POST /ai/moderate` | Bedrock/rules | Built |
| **AI eval / prompt templates / memory governance** | AI ops | Admin governance of prompts, evals, memory | `/admin/*` | admin endpoints | — | Admin only |

Prompt/system-instruction location: `backend/src/modules/ai/` services + the `PromptTemplate` model (admin-managed). Context sources: learner mastery/context, retrieved concept context (pgvector). Fallbacks: services degrade defensively (e.g. low-confidence hedging, teacher-escalation); the Coding Coach UI shows a "coach is resting" state on failure.

---

## 10. AI Guides / Characters

USAM Kids has a **character universe** (defined in `frontend/src/features/characters/lib/characterVisuals.ts` and seeded via `backend/prisma/seeds/seed-character-universe.ts`; model `Character` with `CharacterRole`, plus `CharacterState`, `CharacterInteraction`, `Conversation`).

Named characters with visual identities (color) include: **Azouz** (`#F59E0B`, primary companion/guide), **Zein** (`#0EA5E9`), **Luma** (`#8B5CF6`), **Codey** (`#22C55E`, coding coach), **Nova** (`#6366F1`), **Mira** (`#EC4899`), **Rami** (`#14B8A6`), **Faris** (`#F97316`), **Tala** (`#D946EF`), **Adam** (`#EF4444`), **Byte** (`#0891B2`), **Nour** (`#65A30D`), **Rex** (challenge-oriented), among others.

- **Role:** companions/guides that greet the learner (Azouz on Home hero and onboarding), narrate missions, and back the AI chat.
- **Visual identity:** per-character color + programmatic face (`CharacterFace`/`CharacterAvatar`), bilingual name/blurb.
- **Before login:** characters appear on the public landing hero (visual only).
- **After login:** companion on Home, mission player, character gallery, and (paid) AI chat / voice.
- **Can do:** greet, guide, encourage, (paid) chat/voice via Bedrock, coding help via Codey.
- **Cannot do (as coded):** no cross-product knowledge; AI chat/voice require paid entitlement + live Bedrock; no persistent long-term memory beyond conversation records + governed memory.

---

## 11. API / Route Map (representative)

All backend routes are mounted under the global `/api` prefix (NestJS), JWT-guarded unless noted. Full controller list: ~55 controllers across 42 modules.

| Method | Path | Purpose | Auth | Role |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Create account | No | — |
| POST | `/api/auth/login` | Sign in (returns access+refresh+user) | No | — |
| POST | `/api/auth/refresh` | Refresh token | No | — |
| GET | `/api/auth/me` | Current user | Yes | any |
| PATCH | `/api/auth/me/age-band` | Set age band | Yes | learner |
| PATCH | `/api/auth/me/preferences` | Set interests/preferences | Yes | learner |
| GET | `/api/worlds` | Worlds + unlock state | Yes | learner |
| GET | `/api/missions` · `/:id` | Browse / detail | Yes | learner |
| POST | `/api/missions/:id/start` | Start (gated: missionsPerDay) | Yes | learner |
| POST | `/api/missions/runs/:runId/submit` | Submit activity | Yes | learner |
| POST | `/api/missions/runs/:runId/complete` | Complete + XP outcome | Yes | learner |
| GET | `/api/mastery/overview` · `/by-domain` | Mastery | Yes | learner |
| GET | `/api/adaptive/recommendations` | Recommendations | Yes | learner |
| GET | `/api/gamification/{progression,streak,rank}` | Gamification | Yes | learner |
| GET | `/api/credentials/me` · `/:uid` | Credentials (`:uid` public verify) | Mixed | learner/public |
| GET | `/api/simulations` · `/:slug` | Simulations | Yes | learner |
| POST | `/api/coding-sandbox/submissions` | Grade code | Yes | learner |
| POST | `/api/coding-coach/{debug,explain,review,challenge}` | AI coding help | Yes | paid learner |
| POST | `/api/characters/:id/chat` | AI character chat | Yes | paid learner |
| POST | `/api/voice/turn` | Voice turn | Yes | paid learner |
| GET | `/api/entitlements/plans` | List plans | **No (public)** | — |
| GET | `/api/entitlements/me` | Current plan/features | Yes | guardian |
| POST | `/api/entitlements/subscribe` | Subscribe | Yes | guardian |
| GET | `/api/parents/*` | Family/child data | Yes | guardian |
| POST | `/api/legal/consent` · `GET /legal/export/:id` · `POST /legal/delete/:id` | COPPA/GDPR | Yes | guardian |

Frontend API client: `frontend/src/lib/api/endpoints.ts` (per-domain `*Api` objects) + `frontend/src/lib/api/client.ts` (axios instance, JWT interceptor, 401 refresh).

---

## 12. Database / Data Model (key entities)

PostgreSQL via Prisma (`backend/prisma/schema.prisma`), ~90 models. Core clusters:

- **Identity:** `User`, `Learner`, `Guardian`, `Guardianship`, `LearnerContext`.
- **Curriculum:** `Domain`, `Skill`, `Competency`, `Concept`, `LearningObjective`, `LearningPath`(+`Node`,`Progress`), prerequisites.
- **Activities & missions:** `Activity`, `Mission`, `MissionActivity`, `MissionRun`, `ActivityAttempt`, `MissionReflection`.
- **Mastery & evidence:** `MasteryRecord`, `Evidence`, `Credential`(+`Definition`), `MisconceptionPattern`, `CognitiveLoadSignal`, `InterventionRecommendation`.
- **Gamification:** `Progression`, `XPGain`, `PracticeStreak`, `StreakFreezePurchase`, `AvatarCosmetic`, `LearnerCosmeticUnlock`, `DailyGoal`, `Notification`.
- **Content engines:** `Story`(+`Page`), `SimulationScenario`(+`DecisionPoint`), `CreativityPrompt`(+`Submission`), `Flashcard`(+`Review`), `VisualLanguageCard`, `Rubric`(+`Criterion`), `QuestionTemplate`, `ContentItem`/`ContentSource`/`ContentLicense`, domain-concept tables (Coding/AILiteracy/CriticalThinking/etc.).
- **AI:** `Character`(+`State`,`Interaction`), `Conversation`(+`Message`), `PromptTemplate`, `AIUsageLog`, `AIEvalRun`/`Result`.
- **Projects:** `Project`(+`Milestone`,`Collaborator`).
- **Billing:** `Plan`, `Subscription`.
- **Safety/compliance:** `ConsentRecord`, `DataSubjectRequest`, `SafetyPolicy`, `SafetyEscalation`, `ModerationLog`, `QuarantinedContent`, `AdminAuditLog`.
- **Platform:** `Experiment`(+`Assignment`), `FeatureFlag`, `Translation`, `MediaAsset`, `LearningEvent`.

---

## 13. Analytics / Tracking

- **Existing:** `LearningEvent` model + `analytics` module/controller (`/admin/analytics`) capture learning events; OpenTelemetry traces backend requests; Pino structured logs. Gamification (`XPGain`, streaks, daily goals) is effectively event data.
- **No** third-party product analytics (GA/Segment/Amplitude) or client-side conversion pixels were found.

**RECOMMENDATIONS (not built):** for the Master Page, emit ecosystem-level funnel events — `master_view`, `product_card_click{product}`, `product_redirect{product}`, `signup_start{product}`, `signup_complete{product}`, `ai_guide_open{product}`. Track cross-product referral so the Master Page's contribution to each product is measurable.

---

## 14. Mobile / Responsive

- Tailwind breakpoints (default `sm/md/lg/xl`). Nav is **responsive**: floating pill nav on `lg+`, bottom-bar + "More" drawer on small screens (`AppShell.tsx`).
- RTL is a real layout mirror (`dir`/`lang` on `<html>`, `rtl:` variants), not just translated text.
- Cards/grids use responsive column counts (`grid-cols-1 sm:… lg:…`).
- **Known:** companion/decorative elements are hidden on the smallest screens for readability; large vendor chunks (codemirror/sandpack) affect first-load on mobile networks (see Problems). No dedicated tablet-specific layer beyond breakpoints.

---

## 15. Current Problems

**CRITICAL** — none blocking observed at audit time; live verification (`scripts/verify-deployment.sh`) passes all route/health checks.

**HIGH**
- **AI features unverifiable without Bedrock creds:** character chat, English coach, coding coach, voice, AI feedback/hint/explain cannot be confirmed working end-to-end from this environment. They are gated and degrade defensively, but live behavior is unconfirmed.
- **Payment gateway not real:** `/plans` subscribe uses the **manual** payment provider (activates immediately, no charge). No live processor (Stripe/Paymob) integrated yet.

**MEDIUM**
- **Large JS chunks** (`vendor-*` ~940 kB, sandpack ~493 kB, codemirror ~465 kB) exceed the 500 kB warning; no route-level code-splitting for the heavy coding stack.
- **Voice depends on external Python ASR/TTS sidecars** (`services/asr-sidecar`, `services/tts-sidecar`) that must be running.
- **Free-tier behavior change:** FREE plan has `aiTutor:false` — existing free users now see upgrade prompts on AI chat (intended monetization, but a UX change to be aware of).

**LOW**
- Migrations are raw SQL applied manually (no Prisma migration history) — drift risk mitigated by `scripts/check-migrations-applied.ts`.
- Full WCAG conformance not yet verified with assistive tech (automated axe gate passes; manual AT review pending).
- Some content engines are structurally complete but **content-volume-light** per age band (authoring, not code).

---

## 16. Master Landing Page Readiness

### Product identity
**USAM Kids** — an AI-native, child-first learning universe for ages 7–15.

### Core promise
A child can enter alone, be understood, and be guided by characters and adaptive learning through English, coding, AI literacy, and real projects — producing visible evidence of growth parents can trust.

### Target audiences
- Children 7–15 (bands 7–9, 10–12, 13–15)
- Parents/guardians (buyers, monitors)
- Schools/classrooms (B2B, SCHOOL plan)

### Main features to present on the Master Page
Adaptive missions (story→learn→practice→reward), six learning worlds, coding sandbox (Python/JS/visual), AI companions, English engine, projects + portfolio, verifiable credentials, parent dashboard with COPPA/GDPR safety, gamification.

### Major user outcomes
Learn English + coding + AI literacy; complete real projects; earn verifiable credentials; build a portfolio of evidence; progress by demonstrated mastery.

### AI to present
The **character companions** (Azouz as the flagship guide; Codey for coding), plus adaptive recommendations. Present AI as "learning companions," and note voice + AI chat as premium.

### Entry points (redirects)
- Primary: `https://kids.usamif.com/` (landing)
- Sign up: `https://kids.usamif.com/register`
- Sign in: `https://kids.usamif.com/login`
- Pricing: `https://kids.usamif.com/plans`

### Deep links (Master → product → feature → exact route)
- Explore worlds → `https://kids.usamif.com/worlds`
- Try a mission → `https://kids.usamif.com/missions`
- Coding → `https://kids.usamif.com/missions` (coding missions) / sandbox in player
- English → `https://kids.usamif.com/english`
- Simulations → `https://kids.usamif.com/simulations`
- Portfolio/evidence (parent proof) → `https://kids.usamif.com/portfolio`
- Balanced development (parent proof) → `https://kids.usamif.com/balanced`
- Parent area → `https://kids.usamif.com/parents`
- Plans/pricing → `https://kids.usamif.com/plans`

> Note: most learner deep links require auth; the Master Page should route unauthenticated users to `/register` or `/login` with an intended-destination redirect.

---

## 17. Master Page Content Data (machine-readable)

```json
{
  "product": "USAM Kids",
  "tagline": "An AI-native learning universe for kids 7–15",
  "description": "A child-first platform where kids learn English, coding, and AI literacy through adaptive missions, projects, and character companions — producing visible, verifiable evidence of growth for parents.",
  "targetUsers": ["Children 7-9", "Children 10-12", "Children 13-15", "Parents/Guardians", "Schools"],
  "coreOutcomes": [
    "Learn English (vocabulary to conversation, CEFR-aligned)",
    "Learn coding (visual to Python/JavaScript)",
    "Build AI literacy",
    "Complete real projects and build a portfolio",
    "Earn verifiable credentials (Open Badges)",
    "Progress by demonstrated mastery"
  ],
  "features": [
    "Adaptive missions (story-learn-practice-reward)",
    "Six learning worlds",
    "In-browser coding sandbox (Python/JS/visual)",
    "AI character companions + coaches",
    "English engine",
    "Simulations, stories, creativity",
    "Projects + evidence portfolio",
    "Verifiable credentials",
    "Gamification (XP/levels/streaks/leaderboard/cosmetics)",
    "Parent dashboard + COPPA/GDPR privacy controls",
    "Plans & subscriptions (Free/Explorer/Family/School)"
  ],
  "aiAgents": [
    {"name": "Azouz", "role": "Primary companion/guide", "surface": "landing, home, missions"},
    {"name": "Codey", "role": "Coding coach", "surface": "coding missions"},
    {"name": "Zein", "role": "Companion/guide", "surface": "missions/worlds"},
    {"name": "Luma", "role": "Companion/guide", "surface": "parents/onboarding"},
    {"name": "Rex", "role": "Challenge companion", "surface": "challenge missions"}
  ],
  "importantRoutes": [
    "https://kids.usamif.com/",
    "https://kids.usamif.com/register",
    "https://kids.usamif.com/login",
    "https://kids.usamif.com/plans",
    "https://kids.usamif.com/dashboard"
  ],
  "deepLinks": [
    {"label": "Worlds", "route": "https://kids.usamif.com/worlds"},
    {"label": "Missions", "route": "https://kids.usamif.com/missions"},
    {"label": "English", "route": "https://kids.usamif.com/english"},
    {"label": "Simulations", "route": "https://kids.usamif.com/simulations"},
    {"label": "Portfolio", "route": "https://kids.usamif.com/portfolio"},
    {"label": "Balanced Development", "route": "https://kids.usamif.com/balanced"},
    {"label": "Parents", "route": "https://kids.usamif.com/parents"},
    {"label": "Plans", "route": "https://kids.usamif.com/plans"}
  ],
  "brandColors": [
    {"name": "primary-teal-600", "hex": "#1c5a4d"},
    {"name": "primary-teal-500", "hex": "#2b7061"},
    {"name": "accent-terracotta-500", "hex": "#d96a2c"},
    {"name": "secondary-gold-500", "hex": "#cf9316"},
    {"name": "success-emerald-500", "hex": "#10b981"},
    {"name": "brand-hero-gradient", "hex": "linear-gradient(135deg,#12403a,#1c5a4d,#2b7061)"}
  ],
  "brandAssets": [
    "frontend/src/assets/usam-logo.png",
    "frontend/public/usam-logo.png",
    "frontend/src/features/characters/lib/characterVisuals.ts"
  ],
  "navigation": [
    "Home (/dashboard)", "Missions (/missions)", "Worlds (/worlds)", "English (/english)",
    "Simulations (/simulations)", "Projects (/projects)", "Portfolio (/portfolio)",
    "Balanced (/balanced)", "Achievements (/achievements)", "Community (/community)",
    "Characters (/characters)", "Plans (/plans)", "Parents (/parents)"
  ],
  "userRoles": ["LEARNER", "GUARDIAN", "ADMIN"],
  "integrations": ["AWS Bedrock (AI)", "AWS S3 (storage)", "PostgreSQL + pgvector", "Redis/BullMQ", "OpenTelemetry", "Pyodide", "Sandpack", "Blockly", "i18next (EN/AR)"]
}
```

---

## 18. File Map

| Area | Path |
| --- | --- |
| **Frontend root** | `frontend/` |
| Routes | `frontend/src/app/router/index.tsx` |
| Pages/features | `frontend/src/features/*` (auth, onboarding, dashboard, missions, learning, english, coding, creativity, thinking-skills, cross-curricular, projects, stories, characters, voice, gamification, community, parents, billing, analytics, admin) |
| Shared components | `frontend/src/components/` (layout, common, ui, celebrations) |
| App shell / navigation | `frontend/src/components/layout/AppShell.tsx` |
| Design tokens | `frontend/tailwind.config.js` |
| Global styles / component classes | `frontend/src/styles/index.css` |
| API client | `frontend/src/lib/api/client.ts`, `frontend/src/lib/api/endpoints.ts` |
| i18n (EN/AR) | `frontend/src/lib/i18n/index.ts`, `frontend/src/lib/i18n/locales/{en,ar}.ts` |
| Character visuals | `frontend/src/features/characters/lib/characterVisuals.ts` |
| Brand assets | `frontend/src/assets/usam-logo.png`, `frontend/public/usam-logo.png` |
| Tests | `frontend/src/**/*.test.tsx`, `frontend/src/test/` (setup, providers, a11y) |
| **Backend root** | `backend/` |
| Modules (42) | `backend/src/modules/*` |
| AI | `backend/src/modules/ai/` (character, coding-coach, english-coach, services, prompts) |
| Voice | `backend/src/modules/voice/` (+ `services/asr-sidecar`, `services/tts-sidecar`) |
| Entitlements/billing | `backend/src/modules/entitlements/` (+ `payment/`) |
| Database schema | `backend/prisma/schema.prisma` |
| Migrations (raw SQL) | `backend/prisma/migrations/*.sql` |
| Seeds | `backend/prisma/seeds/*.ts`, `backend/prisma/seed.ts` |
| Config | `backend/nest-cli.json`, `backend/tsconfig.json`, `backend/.env(.example)`, `frontend/vite.config.ts`, `frontend/.env` |
| Deploy | `scripts/verify-deployment.sh`, PM2 (`usam-backend`), nginx |
| **Reconstruction program docs** | `plans-local/*.md` (north star, gap analysis, engine inventory, pricing/business, sequence, status) |

---

## RECOMMENDATIONS (not existing functionality)

1. **Shared identity/SSO** across USAM products — currently Kids auth is self-contained. A shared identity provider would let the Master Page hand off logged-in users.
2. **Ecosystem analytics events** (section 13) for cross-product funnel attribution.
3. **Public deep-link handling** — most learner routes require auth; add an "intended destination" redirect so Master → deep-link → login → target works cleanly.
4. **Route-level code-splitting** for the heavy coding stack (Pyodide/Sandpack/CodeMirror) to improve Master→product first-load on mobile.
5. **Real payment gateway** behind the existing provider interface before promoting paid plans from the Master Page.
6. **Shared design tokens package** — extract the teal/gold/terracotta palette + Nunito type into a shared package if the Master Page and sibling products should feel visually unified.

---

*End of audit. Based on the actual codebase at branch `fix/p0-p1-remediation`; AI runtime behavior noted as unverified where it depends on live AWS Bedrock credentials.*
