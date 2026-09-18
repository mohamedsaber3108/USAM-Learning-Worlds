# USAM for Kids — Reference-Informed Frontend UX Audit

> Honesty note: this document applies **well-established, documented UX patterns**
> from the reference products as design input. It is not a claim that each
> product's authenticated flows were browsed screen-by-screen. Patterns cited
> are the widely-known, public behaviours of these products. Every decision
> below is turned into concrete implementation in the codebase (see the
> "Implementation status" column), per the brief's "implement, don't just
> report" rule.

## 1. Reference groups → patterns extracted

### Kids learning (Lingokids, Khan Academy Kids, PBS Kids, ABCmouse, ABCya)
- **Character-anchored navigation & guidance** — a recurring companion frames
  the experience; kids navigate by recognizable faces/worlds, not text menus.
- **Big, few, obvious choices** — the youngest bands see a small number of
  large tappable targets, not dense grids.
- **"Play = learn"** — activities are framed as play; progress is celebratory,
  never punitive.
- **Parent space is separate** — a distinct, calmer, denser adult surface.

### Language (Duolingo, Duolingo ABC, Memrise, Busuu, ELSA)
- **A single visible path** — one clear "what's next" node; the learner never
  wonders where to go.
- **Streaks + XP + gentle failure** — motivation loops that reward return, and
  treat mistakes as ret[ryable, not final.
- **Micro-feedback** — immediate, animated correct/incorrect feedback.
- **CEFR-style laddered progression** (Busuu) for structured levels.
- **Pronunciation/speech feedback** (ELSA) — visual feedback on spoken input.

### Coding (Scratch, Code.org, Tynker, Blockly, MakeCode)
- **Block → text progression** — start visual (Blockly), graduate to code.
- **Run-in-place sandbox with a visible result** — immediate execution feedback.
- **Project creation as first-class**, not just exercises.

### Creative / STEM / Story (Tinkercad, Canva Edu, Brilliant, PhET, Epic, NatGeo Kids)
- **Interactive explanation over passive reading** (Brilliant/PhET).
- **Discovery-by-cards with rich imagery** (Epic, NatGeo Kids).
- **Creation workspace patterns** — templates + canvas + clear save/publish.

### Premium / motion (Apple, Linear, Notion, Figma)
- **Strong type hierarchy + generous spacing** — one clear focal point per view.
- **Purposeful motion** — transitions communicate state, never decorate.
- **Command/search** (Linear) for power navigation on older bands.

## 2. USAM page-by-page mapping (adopt / improve / avoid)

| USAM page | Relevant refs | Adopt | Improve on current | Deliberately avoid | Impl status |
|---|---|---|---|---|---|
| Landing | Apple, Duolingo, Lingokids | Gradient world hero, animated mascots, clear single CTA | (done) flat → immersive | Feature-list wall, generic SaaS hero | ✅ done |
| Login / Signup | Linear, Duolingo | Split-screen brand panel + focused form | (done) plain card → branded | Distracting nav during auth | ✅ done |
| Child onboarding | Duolingo, Khan Kids | One decision per step, character-guided, progress bar | Keep wizard, richer character presence | Long forms, age as a dropdown only | existing wizard OK |
| Dashboard / Home | Duolingo, Prodigy, Lingokids | ONE "continue" focal action; journey next-step; secondary stats quiet | (done header) + body: lead with next action | 4-up identical stat boxes | 🔜 this pass |
| Learn / Curriculum | Khan Kids, NatGeo Kids | Domain "worlds" as vibrant tiles; concept cards with mastery state | Domain list → world tiles | Dense table of concepts | 🔜 this pass |
| Learning Paths | Duolingo path, Prodigy quests | Journey tiles w/ step count + start affordance | (done) plain cards → journey banners | Wall of equal cards | ✅ done |
| Missions browse | Prodigy, Code.org | Type/difficulty as color-coded chips; clear time estimate | (done header); grid centering | — | ✅ header done |
| Mission detail / player | Duolingo lesson, MakeCode | Focused single-activity view, immediate feedback | Player internals polish | Cluttered chrome during activity | later |
| Characters | Duolingo, Lingokids | Roster with personality + unlock hints, big animated faces | (done) plain → playful XL avatars | Static sticker avatars | ✅ done |
| English | Busuu (CEFR), ELSA (speech) | CEFR ladder, coach CTA | (done header) strand cards polish | — | ✅ header done |
| Coding | Blockly, MakeCode, Scratch | Block+run sandbox (already have Pyodide/Blockly) | Wrap in cohesive shell | — | functional |
| Projects / Portfolio | Canva Edu, Tinkercad | Creation cards + showcase grid | (done header) | — | ✅ header done |
| Progress / Mastery | Duolingo, Brilliant | Visual mastery, growth over time | (done header) | Raw numbers only | ✅ header done |
| Achievements / Leaderboard | Prodigy, Duolingo | Badges, rank, streaks celebratory | (done header) | Shaming comparisons | ✅ header done |
| Parent dashboard | Khan Kids, Lingokids parent | Calmer adult surface, evidence + controls | Distinct from child (already parent-* styles) | Kid-playful styling on adult surface | later |
| Empty / Loading / Error | LottieFiles, Duolingo | Character-driven states w/ clear next action | (done) elevated to playful | Bare spinner / "Something went wrong" | ✅ done |

## 3. Age adaptation (implemented via `useAgeAdaptation`)
- **8–9 (simple):** fewer cards, larger controls, one-word labels, stronger
  character presence, shorter copy. (Live: dashboard card-count + nav sizing.)
- **10–11 (moderate):** more autonomy, adds rank/mastery, more text.
- **12–14 (detailed):** full stat detail, denser layouts, command/search-friendly.
The visual language matures with the band — same design system, different density.

## 4. Character system (Azouz & crew)
- Live: hand-crafted animated SVG `CharacterFace` (idle bob/blink/breathing),
  used in landing, auth, empty/error states, gallery, chat.
- Adopt next: contextual reactions on success/failure/mission-complete
  (celebration overlay exists — extend to more moments).
- Avoid: a floating chatbot bubble detached from the experience.

## 5. Navigation
- Desktop: persistent grouped **sidebar rail** (Learn / Play / You). Mobile:
  **bottom tab bar** + More sheet. Both live.
- Age note: youngest band gets larger nav targets (live). Command/search bar
  exists for older bands.

## 6. Motion
- Tokens live: `drift`, `bob`, `pop-in`, `float-soft`, `pulse-soft`,
  `shimmer-sweep`, `wobble-once`, plus route `PageTransition`.
- Rule: motion communicates state (progress, unlock, feedback), never decorates.

## 7. Iconography
- Standardized on **lucide-react** (single coherent stroke system) + bespoke
  illustrated `CharacterFace` SVGs for characters. No mixed icon libraries.

## 8. Remaining work (honest)
Dashboard body, Curriculum world tiles, mission player, parent/admin surfaces,
native-Arabic RTL depth, and richer per-activity feedback. Tracked and
implemented incrementally, each verified + committed + pushed.
