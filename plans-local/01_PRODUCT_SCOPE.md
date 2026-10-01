# 01 — PRODUCT SCOPE (locked)

> The scope the owner locked this session. This document OVERRIDES any earlier
> scope statement (including `docs/product/USAM_KIDS_PRODUCT_BIBLE.md`) where
> they conflict. Divergences from prior docs are listed in §9 so nothing is lost
> silently.

---

## 1. What USAM for Kids IS

An Arabic-first (EN + AR/RTL), AI-native **learning universe** for children ages
**8–14**, where a child can enter alone, be understood, and be guided — by a
companion (Azouz), specialist characters, voice, and adaptive learning — through
four primary domains, producing **visible, verifiable evidence of growth** that
parents trust. It must feel like **a world you return to**, not a catalog of
courses or a generic LMS.

## 2. Who it is for

- **Children 8–14** — the primary users; must be able to operate the product
  self-directed, without a live teacher or a parent driving it.
- **Parents / guardians** — the buyers and monitors; involved by choice. A child
  never purchases; purchasing belongs to the account owner.
- **Moderators** — trust & safety operations.
- **Admins** — content/curriculum/platform operations.
- **Schools (B2B)** — future, not in the first commercial cut.

## 3. Primary learning domains (LOCKED — exactly 4)

1. **English** — language acquisition to standalone-premium quality (vocab,
   grammar, reading, listening, speaking, pronunciation/phonics, writing,
   conversation, roleplay, stories, CEFR progression, placement, review,
   mastery, projects).
2. **Coding / Computational Thinking** — decomposition, logic, loops/conditions,
   data, algorithms, debugging-as-method, real sandbox execution, projects.
3. **AI Literacy & Creation** — how models predict, data & bias, judging AI
   output, prompt/creation literacy, responsible use.
4. **Entrepreneurship / Young Business Building** — age-appropriate &
   project-driven: Problem → Idea → User → Solution → Create → Test → Improve →
   Value → Money-basics → Pitch. Older learners: customer discovery, simple
   business models, pricing, budgeting, branding, digital products, marketing
   concepts, negotiation, pitching, simulations. **Not** corporate theory.

## 4. Supporting / cross-domain competencies

Integrated across missions/projects (may become standalone where justified, but
start as cross-domain): Creativity & Design · Critical Thinking · Problem Solving
· Communication · Collaboration · Digital Literacy · Digital Safety ·
Financial/Life Skills · Research Skills · Media Literacy · Project Skills ·
Future Skills.

## 5. Explicitly NOT primary domains

Science, Mathematics, Social Studies, Geography, and other traditional school
subjects are **not** primary USAM domains. They may appear **contextually** inside
projects, simulations, coding/AI missions, entrepreneurship scenarios, and
research challenges when they strengthen learning. Promoting any to a primary
domain requires explicit product justification (owner decision).

## 6. Voice — core capability (not an add-on)

Voice is a cross-platform capability supporting: Azouz conversations, English
speaking & pronunciation, roleplay, mission guidance, oral responses, listening,
accessibility, and character interaction. Architecture must stay
**provider-independent** (no hard lock to one STT/TTS vendor). EG-Arabic child
speech is the hard benchmark.

## 7. Character universe (15, Azouz primary)

In scope, architecture supports the full roster; the learner sees a contextual,
progressively unlocked subset.

| # | Name | Role |
|---|------|------|
| 1 | **Azouz** | Main companion (owns onboarding continuity, orientation, mission guidance, help, progression, specialist introductions) |
| 2 | Zein | Explorer / discovery |
| 3 | Luma | English coach |
| 4 | Codey | Coding mentor |
| 5 | NOVA | AI mentor (NOT the main persona — Azouz is) |
| 6 | Mira | Creativity & Design |
| 7 | Rami | STEM/Science explorer (contextual only — does NOT make Science a primary domain) |
| 8 | Faris | Critical Thinking / Problem Solving |
| 9 | Tala | Communication / Confidence |
| 10 | Adam | Entrepreneurship |
| 11 | Byte | Digital Skills / Safety |
| 12 | Nour | Life / Financial Skills |
| 13 | Rex | Friendly Challenger |
| 14 | Zara | Storyteller |
| 15 | Atlas | World / Progression guide |

Azouz behavioral guardrails: never create emotional dependency, never ask for
secrecy, never replace parents, never manipulate or emotionally pressure the
child. Specialist characters enter when educationally relevant. (Full spec: 23.)

> NOTE: the current frontend `src/data/characters.ts` uses a DIFFERENT 10-name
> cast (Azouz, Lina, Koda, Nova, Mira, Sable, Omar, Fable, Sol, Rune). The
> backend seeds only "Azouz". This locked 15-roster supersedes both; the mapping
> old→new is tracked in 23_CHARACTER_SYSTEM.md.

## 8. Ages & adaptation (LOCKED)

Target **8–14**. Working bands **8–9 / 10–11 / 12–14** (backend enum
`AGE_8_9 / AGE_10_11 / AGE_12_14`). Age is NOT the only adaptation variable;
personalization uses **age + ability + mastery + interests + learning history +
current objective**. (Full spec: 07.)

## 9. Divergences reconciled (so nothing is lost)

| Topic | Prior doc said | LOCKED now | Why |
|---|---|---|---|
| Age range | 7–15 (Product Bible §1/§3) | **8–14** | Owner lock; matches backend `AgeBand` enum |
| Entrepreneurship | cross-cutting future-skill (Bible §5) | **4th PRIMARY domain** | Owner lock |
| Core domains | English/Coding/AI (3) | **English/Coding/AI/Entrepreneurship (4)** | Owner lock |
| Character roster | 10-name frontend cast / Azouz-only backend | **15-name locked roster** | Owner lock |
| Voice | "first-class where age-appropriate" | **core cross-platform capability** | Owner lock (stronger) |

## 10. Commercial scope

`Product → Package → Plan → Entitlement → Subscription → Child Access → Usage
Limits`. Packages combine domains + competencies + projects + practice + voice +
characters + portfolio. Prices are **configurable**, not hardcoded; final price
values require owner sign-off before charging real customers. (Full spec:
10 + 11.) **[GREENFIELD]** — none of this is modeled in the backend yet (see 02).

## 11. Out of scope for the first production cut

Schools/B2B billing, real-time multiplayer collaboration, native mobile apps,
and any traditional-school-subject curriculum. Tracked as future, not built now.
