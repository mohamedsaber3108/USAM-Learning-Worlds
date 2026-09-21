# 02 — Complete Feature Traceability Matrix

Acceptance criterion is the **complete user experience**, NOT the existence of a
controller/route/component. Every major feature/engine from the mandate is
listed. Status codes: 1 Correct · 2 Partial · 4 Backend-only · 5 Frontend-only ·
6 Hidden · 10 Missing · 11 Needs-redesign · 12 Needs-research · 13 Needs-OSS.

Legend for columns: BE=backend controller exists · API=frontend api client wired
· PAGE=dedicated page/route · UX=complete flow w/ states · AGE=age-adaptive ·
i18n=EN+AR wired · Status.

| # | Feature / Engine | BE | API | PAGE | UX | AGE | i18n | Status | Gap / required action |
|---|---|----|----|----|----|----|----|----|----|
| 1 | Auth (login/register/refresh/me) | Y | Y | Y | 2 | n/a | 2 | 2 | Works; register flow + error states need polish; confirm AR strings on both. |
| 2 | Onboarding (lang→welcome→age→character→complete) | Y (age-band) | Y | Y | 1 | Y | Y | 1 | Solid; keep. Add interests/diagnostic step (mandate §11) → 10 for that sub-part. |
| 3 | Home / Dashboard | Y (multi) | Y | Y | 2 | Y | Y | 11 | Reads as dashboard, not "living world". Slice 3 rebuild around continue/recommend/world/character. |
| 4 | Missions browse/detail/player/complete | Y | Y | Y | 2 | 2 | 2 | 11 | Flow exists as generic cards; rebuild as story→learn→practice→mastery→reward (Slice 4). |
| 5 | Learning: concepts + prerequisite graph | Y | Y | Y | 2 | 2 | 2 | 2 | ConceptDetail + graph exist; unify under Learn hub IA (Slice 5). |
| 6 | Learning paths | Y | Y | Y | 2 | 2 | 2 | 2 | Journey tiles exist; fold into Learn hub. |
| 7 | Flashcards (spaced repetition) | Y | Y | Y | 2 | 2 | 2 | 2 | Works; visual polish + AR. |
| 8 | Visual language study | Y | Y | Y | 2 | 2 | 2 | 2 | Niche; verify reachable from nav (currently semi-hidden → 6). |
| 9 | Mastery overview / by-domain / review-due | Y | Y | partial | 2 | Y | 2 | 2 | Surfaced inside dashboard/progress; no dedicated mastery map → consider page. |
| 10 | Gamification: XP/level/progression | Y | Y | Y | 1 | Y | Y | 1 | Good. |
| 11 | Streaks + streak-freeze | Y | Y | Y(shop) | 2 | Y | 2 | 2 | Freeze purchase in shop; surface streak-at-risk (notifications). |
| 12 | Rank / leaderboard | Y | Y | Y | 2 | 2 | 2 | 2 | Opt-in gating (leaderboardOptIn) must be respected in UI — verify. |
| 13 | Achievements | Y | Y | Y | 2 | 2 | 2 | 2 | Badge grid; polish. |
| 14 | Daily goals | Y | Y | card | 2 | Y | 2 | 2 | DailyGoalCard on dashboard; no set-goal UI surfaced → partial. |
| 15 | Cosmetics shop (border/badge/title/theme) | Y | Y | Y | 2 | 2 | 2 | 2 | Works; equipped cosmetics reflected on dashboard avatar. |
| 16 | Projects (create/build/milestones/showcase) | Y | Y | Y | 2 | 2 | 2 | 11 | Rebuild as brief→plan→build→feedback→portfolio journey (Slice 7). |
| 17 | Portfolio | Y | Y | Y | 2 | 2 | 2 | 2 | Exists; tie to project evidence. |
| 18 | Project collaborators / research notes | Y | Y | in-detail | 2 | 2 | 2 | 2 | Backend rich; UI thin. |
| 19 | Community feed/trending/search/report | Y | Y | Y | 2 | 2 | 2 | 2 | Works; moderation surfaced to educators only. |
| 20 | Characters gallery + unlock | Y | Y | Y | 2 | 2 | 2 | 2 | Bespoke SVG faces; verify unlock states. |
| 21 | Character chat (per-character) | Y | Y | Y | 2 | 2 | 2 | 2 | Depends on AI creds (Bedrock) — degrade gracefully. |
| 22 | Character conversations (threads/pause/resume) | Y (rich) | partial | partial | 10 | 2 | 2 | 4 | Backend has full conversation API; frontend uses simple chat only → surface threads. |
| 23 | AI feedback/hint/explain/analyze | Y | partial | in-mission | 2 | 2 | 2 | 4 | Wire into mission player + coach; needs Bedrock creds in prod (blocker to verify). |
| 24 | Voice chat | Y (static audio) | Y | Y | 2 | 12 | 2 | 12 | Voice pipeline partial; research proper STT/TTS surface. |
| 25 | English strands (CEFR) | Y | Y | Y | 2 | 2 | 2 | 2 | List + filters; expand to full skill journey (Slice 6). |
| 26 | English coach (conversation/grammar/vocab/reading) | Y | Y | Y | 2 | 2 | 2 | 4 | UI exists; depends on AI creds; make it a real adaptive journey. |
| 27 | Coding sandbox (Sandpack/Pyodide) | Y | Y | in-mission | 2 | 2 | 2 | 2 | Runs in browser; surface as dedicated Create/Coding area (Slice 7). |
| 28 | Stories (branching reader) | Y | Y | Y | 2 | 2 | 2 | 2 | Reader + choices; polish. |
| 29 | Creativity gallery/prompts/submissions | Y | Y | Y | 2 | 2 | 2 | 2 | Works; visibility controls. |
| 30 | Cross-curricular ×7 categories | Y | Y | Y | 2 | Y | 2 | 2 | One parameterized page; verify all 7 reachable. |
| 31 | Thinking skills ×3 engines | Y | Y | Y | 2 | 2 | 2 | 2 | Reachable via nav? currently semi-hidden → 6. |
| 32 | Adaptive: ZPD/recommendations/next-activity | Y (rich) | Y | none | 10 | 2 | 2 | 4 | Powerful engine, NO learner-facing surface. Feed dashboard "next step" + Learn hub (Slice 3/10). |
| 33 | Learning events / analytics ("My Journey") | Y | Y | Y | 2 | 2 | 2 | 2 | Insights page exists (branded hero added). |
| 34 | Worlds | Y | Y | none | 10 | 2 | 2 | 4 | worldsApi exists, no World page. Core to "living world" — build (Slice 3/4). |
| 35 | Notifications | Y | Y | bell | 2 | 2 | 2 | 4 | Bell in shell; no center/streak-at-risk surfacing → partial. |
| 36 | Credentials (Open Badges / OB3) | Y | none | none | 10 | 2 | 2 | 4 | Backend issues real credentials; NO frontend. Surface in achievements/portfolio. |
| 37 | Reflection (post-mission) | Y | Y | in-complete | 2 | 2 | 2 | 2 | On mission-complete; expand. |
| 38 | Simulation engine | Y | none | none | 10 | 12 | 2 | 4 | Backend engine, no surface, needs research on UX. |
| 39 | Parent dashboard | Y | Y | Y | 2 | n/a | 2 | 2 | Charts exist; audited as strong. |
| 40 | Parent time-limits | Y | Y | Y | 2 | n/a | 2 | 2 | Works. |
| 41 | Parent reflections view | Y | partial | none | 10 | n/a | 2 | 4 | Endpoint exists; no UI. |
| 42 | Entitlements / subscription | Y | none | none | 10 | n/a | 2 | 4 | Billing backend; no learner/parent UI. Decide scope. |
| 43 | Legal / consent (COPPA/GDPR) | Y | none | none | 10 | n/a | 2 | 4 | Consent surface needed in register/parent flow (safety-critical). |
| 44 | Safety / moderation / escalations | Y | partial | admin | 2 | n/a | 2 | 2 | Admin surfaces exist; learner reporting via community. |
| 45 | Admin studio (16 pages) | Y | Y | Y | 2 | n/a | 2 | 2 | Functional CRUD; not learner-facing. |
| 46 | Age adaptation (cross-cutting) | Y | Y | Y | 1 | Y | Y | 1 | useAgeAdaptation real; extend to nav set + character prominence. |
| 47 | i18n + RTL | n/a | n/a | Y | 2 | Y | 2 | 11 | **BUG: LandingPage has ~13 hardcoded English strings** (title, section headings, feature cards, final CTA, footer). Wire to i18n. |
| 48 | Brand / wordmark | n/a | n/a | Y | 2 | n/a | 2 | 11 | **BUG: usam-logo.png renders garbled ("1؏m") esp. RTL.** Replace header wordmark with clean text "USAM" + localized tagline. |

## Cross-cutting gaps (highest priority, from the matrix)

- **Un-surfaced power engines (#32 adaptive, #34 worlds, #36 credentials, #38
  simulation):** rich backend, no learner UX. These are the biggest "backend-only"
  violations of mandate §13. Adaptive + Worlds feed Slice 3/4 directly.
- **i18n completeness (#47):** landing (and likely other marketing/empty-state
  copy) is not fully Arabic. Fix in Slice 0.
- **Brand (#48):** wordmark bug — fix in Slice 0.
- **Safety/consent surface (#43):** COPPA/GDPR consent has no frontend — must be
  addressed before "production" claim.
- **AI-dependent features (#21,23,26):** all gated on Bedrock creds in prod;
  must degrade gracefully and be verified, not assumed working.
