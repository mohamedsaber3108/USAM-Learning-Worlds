# USAM Kids — Competitor UX Research (actionable synthesis)

> Reference Bible §2. **Consolidates** the existing 28-product deep audit in
> `docs/architecture/USAM_COMPETITIVE_UX_AUDIT.md` into rebuild decisions — what
> USAM should adopt, adapt, and avoid. Not a re-scrape; the source audit was live-
> extracted against real product pages. Rule: **learn patterns, do not clone.**

Date: 2026-09-23

---

## Patterns to ADOPT (evidence → USAM application)

| Pattern | Seen in | USAM application |
| --- | --- | --- |
| **World/journey map as the home**, lessons live inside it | Prodigy (Island + zones), ClassDojo (Dojo Islands) | Home is a living world with a world-journey map (shipped as a strip; rebuild → fuller map). Missions live *in* worlds, not a flat list. |
| **Word-free / icon-first navigation for young ages** | CodeSpark (100% word-free), Khan Kids (zero-reading nav), ScratchJr | Age band 7–9 gets iconic, voice-forward, minimal-text nav (age-UX rules in Product Bible §3). |
| **Single clear next action** | Duolingo (one path), IXL (skill tree) | Home surfaces ONE recommended next step (adaptive recommendation) + resume. |
| **Character drives the loop, not decoration** | Duolingo (Duo), Khan Kids (Kodi), CodeSpark (Foos tied to roles) | 15-character roster mapped to domains (Codey=coding, Luma=English…); companions narrate missions + feedback + voice. |
| **Teach → do inside one flow** (no separate "lesson" screen dumps) | Prodigy (math is the cost of the action) | Story→Learn→Practice→Reward keeps teaching adjacent to doing (Learn step shipped). |
| **Progress as visible, motivating artifact** | Reading Eggs (Golden Egg map), IXL (diagnostic tree) | Mastery-by-domain + portfolio + credentials; progress you can *see*. |
| **Discovery-first browse where a library exists** | Epic! (Netflix-style grid) | Stories/simulations/creativity browse can be discovery-grid, not forced sequence. |

## Patterns to ADAPT with caution
- **Reward economies / currency** (ABCmouse tickets, Reading Eggs eggs, ClassDojo points): USAM has XP/cosmetics — keep, but **rewards ≠ mastery** and no pay-to-progress.
- **Avatar/world customization** (Toca, ClassDojo, ABCmouse): cosmetic shop exists; keep as earned motivation, not spending pressure.
- **Phygital** (Osmo): out of scope now; note as future hardware angle.

## Patterns to AVOID (anti-patterns — Bible §20/§21)
- **Guilt/FOMO retention** (Duolingo "sad Duo" guilt notifications, aggressive streak loss): USAM must not punish or guilt children. Streaks encourage, never shame.
- **Engagement-maximization as the goal** (contrast Osmo's explicit stance): optimize for *learning outcomes*, not time-on-app.
- **Open-world with no learning spine** (Toca): USAM's world is a learning journey, not an aimless sandbox.
- **Toxic/global leaderboards for children**: leaderboard is opt-in and bounded.

## MENA / Arabic-specific findings
The source audit covers verified MENA/Arabic-region edtech. Implications for USAM:
- **Arabic-first, real RTL layout mirror** (not translated LTR) — already implemented; the rebuild must preserve and deepen it (Egyptian-Arabic conversational tone in copy, as done in locales).
- **Egyptian-Arabic child voice** is the differentiator and the hardest technical bar (see `VOICE_BENCHMARK.md`).

## Net takeaways for the rebuild
1. **Home becomes a world map**, not a stats dashboard.
2. **Age-band UX is structural** (7–9 iconic/voice-forward vs 13–15 text/self-directed).
3. **Characters are the connective tissue** across missions/feedback/voice.
4. **Motivation is kind** — no guilt, no FOMO, rewards decoupled from mastery.
5. **Arabic-first + EG-Arabic voice** is USAM's defensible edge.

> Full per-product breakdown (28 products, signature patterns, strong/weak): `docs/architecture/USAM_COMPETITIVE_UX_AUDIT.md`.
