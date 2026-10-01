# 12 — CONTENT INVENTORY (what learning content actually exists)

> Per directive §23: audit existing content; classify KEEP/IMPROVE/REMAP/REWRITE/
> REPLACE/DELETE/MISSING. Per directive §25 honesty: distinguish IMPLEMENTED /
> GENERATED / LICENSED / NEEDS-EXPERT-REVIEW / MISSING. Evidence = backend seed
> files + migrations (verified by direct enumeration this session).

Date: 2026-09-30

---

## 1. Reality: the content layer is far larger than first audited

~55 seed files + ~48 migrations exist in `backend/prisma`. The DEFAULT seeder
(`prisma db seed` → `seed.ts`) is STALE (12 school-subject domains + Azouz only),
but the real content lives in named `seed:*` scripts and SQL migrations. The
dominant problem is NOT "no content" — it is (a) the default seeder is wrong, and
(b) the mock-backed frontend doesn't consume the real content.

## 2. Inventory by domain (from seed files)

| Domain | Seeds present | Depth | Classification |
|---|---|---|---|
| **English** | strands (15, CEFR), vocabulary-slice, breadth A1, breadth A2 | strands + vertical slice + A1/A2 breadth | KEEP + IMPROVE (scale to §08.5 target) |
| **Coding** | concepts (19), vertical-slice, breadth A1, sandbox-concept-missions, sandbox-demo | concepts + slice + A1 breadth + sandbox | KEEP + IMPROVE |
| **AI Literacy** | vertical-slice, breadth A1 | slice + A1 breadth | KEEP + IMPROVE (wire to graph) |
| **Entrepreneurship** | (via cross-curricular + simulation-scenarios; no dedicated breadth seed yet) | thin | REMAP + MISSING (needs its own breadth seed as a primary domain) |
| Creativity (support) | creativity-prompts, creativity-vertical-slice | slice | KEEP |
| Supporting (CT/PS/Comm/Digital/Research/Career/Critical/Computational) | dedicated seeds each | concept lists | KEEP as cross-domain |

## 3. Inventory by system

| System | Seed/migration | Classification |
|---|---|---|
| Characters (15 roster) | `seed-character-universe.ts` (all 15 locked names) | KEEP (reconcile FRONTEND to it) |
| Worlds | `seed-worlds.ts` + world-engine migration | KEEP (ensure domain-scoped to 4) |
| Stories | `seed-stories.ts` + story-engine | KEEP |
| Simulations | `seed-simulation-scenarios.ts` + media/sim engine | KEEP |
| Flashcards + FSRS | `seed-flashcards.ts` + `20260910_add_fsrs_flashcard_state.sql` (ts-fsrs ALREADY) | KEEP |
| Pricing plans | `20260924_seed_pricing_plans.sql` | KEEP |
| Credentials/Open Badges | `20260914_add_credentials_open_badges.sql` | KEEP |
| Learning paths | `seed-learning-paths.ts`, `seed-concepts-and-paths.ts` | KEEP (align to 4 domains + stages) |
| Projects/Rubrics | `seed-projects-rubrics.ts` | KEEP |
| Age variants | `seed-age-variants.ts` + wave2 | KEEP |
| Reflection/Flashcard/Question/DailyGoal/Notification | dedicated seeds | KEEP |
| Arabic (human-approved) | `seed-arabic-human-approved.ts` | KEEP (LICENSED/approved) |
| Cosmetics | `seed-cosmetics.ts` | KEEP |
| Safety policies | `seed-safety-policies.ts` | KEEP |
| **Default `seed.ts`** | 12 school-subject domains + Azouz only | **REPLACE** (point at the 4-domain + 15-char seeders) |

## 4. Content provenance / licensing (directive §25 honesty)

Backend has `ContentSource`, `ContentLicense`, `ContentItem` (status workflow),
`AssessmentQualityFlag`, `ContentQAFlag`, translation human-approval. So the
provenance pipeline EXISTS. Each content item must carry a classification:

| Status | Meaning | Where |
|---|---|---|
| IMPLEMENTED | real seeded items in the graph | the `seed:*` slices/breadth |
| GENERATED | AI-generated, pending validation | `ContentItem.generatedBy`, status DRAFT/VALIDATING |
| LICENSED | open/public-domain or licensed source | `ContentLicense`/`ContentSource` |
| NEEDS-EXPERT-REVIEW | authored but not pedagogically reviewed | `ContentItem.status` + QA flags |
| MISSING | required by curriculum (08) but absent | tracked in 13 |

**Rule: no content is shown to a child as "final" unless VALIDATED/approved; AI
GENERATED content stays flagged until review.**

## 5. Honest headline

- Architecture + engines: largely IMPLEMENTED.
- Breadth content: PARTIAL — vertical slices + A1 (some A2) breadth per domain;
  far below the §08.5 v1 scale target (~54 missions/~216 activities per domain).
- Expert pedagogical review: NOT established as a process — treat all authored
  content as NEEDS-EXPERT-REVIEW until a review step exists.
- Default seeder: WRONG — must be replaced.
