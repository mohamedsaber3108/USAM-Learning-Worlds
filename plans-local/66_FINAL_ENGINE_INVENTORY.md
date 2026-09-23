# 66 — Final Engine Inventory (Orphan-Engine Sweep, G-8)

> Mandate §23, §30: every engine must have a real learner/parent-facing surface
> OR be documented as infra-only. Nothing is an accidental orphan. This is the
> reconciliation of the 42 backend modules / ~55 controllers against the actual
> frontend surface.

Last updated: 2026-09-23 · HEAD `8e00d09`

Method: cross-referenced every `@Controller('<path>')` mount against the
frontend's `apiClient` calls (endpoints.ts + direct component calls). Legend:
✅ has learner/parent UX · 🛠 infra/admin-only (correct, no learner UX needed) ·
⚠ real gap (engine exists, learner-facing surface thin/missing).

---

## Learner / parent facing — ✅ (surface confirmed)

| Engine (mount) | Frontend surface |
| --- | --- |
| auth | Login/Register/onboarding |
| worlds | `/worlds` map + Home World Journey strip |
| missions | Browse / detail / player (Learn→Practice) / complete |
| mastery | Balanced Development, portfolio evidence |
| adaptive | Home recommendations |
| gamification | Dashboard XP/level/streak, achievements |
| credentials | Achievements + portfolio (Open Badges) |
| projects | Projects + `/portfolio` |
| simulations | `/simulations` browse + player |
| creativity | Creativity feature pages |
| english / english-coach | English feature pages |
| coding-sandbox | CodeMissionRunner in mission player |
| characters | Character gallery + chat (now aiTutor-gated) |
| voice | Voice chat (now voice-gated) |
| community | Community feed |
| parents | Parent dashboard + privacy/consent |
| legal | Privacy/consent (COPPA/GDPR) |
| daily-goals | Daily goal card on Home |
| flashcards | Flashcards study page |
| learning | Curriculum browse, paths, concept detail |
| reflection | Mission-complete ReflectionQuickCheck |
| stories | Stories list |
| visual-language | Visual language study page |
| search | Search bar |
| questions | Used within activities |
| entitlements | `/plans` page (G-4) |
| notifications | Notification bell |
| computational-thinking / critical-thinking / problem-solving / cross-curricular | Thinking-skills + cross-curricular feature pages |

## Infrastructure / admin-only — 🛠 (no learner UX needed; correct)

| Engine (mount) | Why infra/admin-only |
| --- | --- |
| media (`/media`) | Asset listing/serving — consumed by other features, not a page |
| audit | Compliance audit log — admin/ops |
| feature-flags | Runtime flags — infra |
| experiments | A/B assignment — infra |
| learner-model | Internal learner-state store — read by adaptive/mastery |
| translations | i18n content pipeline — admin, human-approval flow |
| rubrics | Scoring definitions — consumed by assessment |
| safety-escalations | Safety ops queue — moderator/admin |
| difficulty-calibration | Item calibration — infra, feeds adaptive |
| content-items / content-provenance / content-qa | Content ops — admin CMS |
| curriculum-mapping | Curriculum authoring — admin |
| misconceptions / interventions | Signals feeding remediation — surfaced indirectly |
| assessment-quality | Item-quality analytics — admin |
| memory-governance / prompt-templates / safety-policies / ai-eval | AI ops/governance — admin |
| analytics | Reporting — admin/parent dashboards |
| admin/* (all) | Admin CMS surfaces |

## Real gaps — ⚠

### coding-coach (`/coding-coach`: debug, review, explain, challenge)
- **State:** a full AI coding-help engine (4 endpoints) with **zero frontend
  references**. The clear intended home is the coding-sandbox / CODE mission
  runner — a learner stuck on a coding activity should be able to ask for a
  debug hint / explanation.
- **Why not built now:** it is AI-backed (Bedrock), which is **blocked** for
  agent-side verification (same constraint as ai-tutor/voice realtime). Building
  UI against an endpoint I cannot exercise end-to-end risks shipping an
  unverifiable surface.
- **Recommendation:** wire a "Ask the coach" affordance into `CodeMissionRunner`
  (debug/explain on the current code) once Bedrock creds are verifiable, so the
  coach shares the mission-player context. Tracked as **G-9**.
- **Traceability:** engine → requirement (coding help, North Star coding domain)
  → new solution (coach affordance in CodeMissionRunner) → BLOCKED on Bedrock.

---

## Sweep conclusion

Of 42 modules / ~55 controllers: **all have a learner/parent surface or are
legitimately infra/admin-only, except `coding-coach`**, which is a real but
Bedrock-blocked gap now tracked as G-9. No accidental orphans remain
(mandate §30 satisfied at the inventory level).
