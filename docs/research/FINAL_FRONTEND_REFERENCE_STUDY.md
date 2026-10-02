# FINAL FRONTEND REFERENCE STUDY

> Research to drive the USAM final frontend (Landing, navigation, design system,
> role dashboards) BEFORE building — not decoration after. Sources are current
> (2025–2026). Content is paraphrased/summarized for licensing compliance
> (no >30 consecutive words from any source); each row attributes its source.
> Decisions at the bottom feed the design system + Landing + nav directly.

## A. EdTech / kids landing + ecosystem presentation

| Ref | Surface | What works | Pattern to learn | Fit for USAM | Do NOT copy |
| --- | --- | --- | --- | --- | --- |
| [muffingroup — educational website design](https://muffingroup.com/blog/educational-website-design/) | Landing/IA | The primary goal is comprehension, not conversion — which reshapes hierarchy, nav depth, typography, and color logic vs a SaaS site | Optimize the public site for *understanding the ecosystem*, not funnel-to-signup | USAM landing = ecosystem explanation first; CTA second | SaaS conversion-funnel structure |
| [bricxlabs — edtech website designs](https://bricxlabs.com/blogs/best-edtech-website-designs) | Value prop | Strongest sites answer "what problem does this solve for me" immediately, not behind clever copy | One-sentence promise above the fold, plain language | Hero states the USAM promise in child+parent terms plainly | Vague/clever hero copy |
| [designrush — educational website designs](https://www.designrush.com/best-designs/websites/trends/educational-website-designs) | Landing | Best share: a clear entry point per visitor type, proof shown visually not described, interaction that teaches, nav that never makes you hunt | Per-audience entry (child vs parent), show the learning loop visually, interactive not decorative | USAM: distinct child/parent entry; animate the Learn→Practice→Build→Prove→Review loop | Decorative-only animation |
| [easifytechnologies — edtech examples](https://easifytechnologies.com/15-best-edtech-website-design-examples/) | Palette/nav | A clean **white-and-green** palette with prominent CTAs + intuitive nav + help center reads trustworthy | White/green is a proven, credible EdTech palette | Directly validates the mandated WHITE/GREEN/BLACK direction | — |
| [webstacks — edtech websites](https://www.webstacks.com/blog/edtech-websites) | UX/a11y | Balance functionality, UX, and accessibility to support digital learning | Accessibility is a first-class landing concern, not an afterthought | Landing meets a11y baseline (contrast/focus/semantics) from day one | — |

## B. Onboarding (education apps)

| Ref | What works | Pattern | Fit | Do NOT copy |
| --- | --- | --- | --- | --- |
| [substack — onboarding flows in education](https://paywallpro1.substack.com/p/best-user-onboarding-flows-in-education) | Best onboarding is an orchestrated *learning journey*, not a feature showcase; respects heightened cognitive load early | Keep onboarding short, low-load, journey-framed (first meaningful action fast) | USAM onboarding: age → interests → first companion → first real next action; minimal steps | Long multi-step feature tours |
| [hashnode — onboarding flows](https://paywallpro.hashnode.dev/best-user-onboarding-flows-in-education-apps) | Notes K-12 special requirements, accessible design in onboarding | K-12 onboarding needs guardian consent + accessibility built in | USAM guardian onboarding = consent (COPPA/GDPR-K) is part of the flow | — |

## C. Role-based dashboards + admin/CMS

| Ref | What works | Pattern | Fit | Do NOT copy |
| --- | --- | --- | --- | --- |
| [Four Kitchens CMS dashboard patterns (review)](https://victorstackai.hashnode.dev/review-four-kitchens-cms-dashboard-patterns-applied-to-drupal-1011-drupal-cms-and-wordpress-editorial-ux) | Role-based entry points, constrained navigation, strong preview loops, governance signals embedded in the authoring flow | Admin: task-oriented areas, in-flow status/governance (not buried), preview before publish | USAM admin: 6 task areas; content lifecycle status inline; DRAFT→PUBLISHED with visible state | One giant table admin |
| [lollypop — portal UX](https://lollypop.design/blog/2026/june/portal-ux-design/) | Role-based experiences + IA + scalable design system + dashboards that help prioritize | Each role gets its own IA + a "what matters now" prioritization | USAM: distinct learner/guardian/moderator/admin shells; each surfaces the one next action | Generic identical portal for all roles |
| [adminlte — admin dashboard design](https://adminlte.io/blog/admin-dashboard-design/) | Proven layouts + clear light rules; clutter/untrustworthy panels are the failure mode | Restraint: few proven layouts, clear hierarchy, trustworthy density | USAM admin uses the shared DS, not a dense clone | Cluttered control-panel density |
| [medium — anatomy of admin dashboard](https://rosalie24.medium.com/the-anatomy-of-an-effective-admin-dashboard-design-9144a0b24853) | Role-based dashboards show only relevant metrics/tools per role | Show each role only what it can act on | Moderator ≠ admin clone; guardian sees child-relevant only | Exposing all tools to all staff |

## Decisions that feed implementation

1. **Palette confirmed**: WHITE canvas + GREEN as the single brand hue + near-BLACK ink. External EdTech evidence backs white/green as trustworthy. No legacy rainbow.
2. **Landing = ecosystem comprehension, not a funnel.** Structure by the learner's actual journey (Discover → Learn → Practice → Build → Prove mastery → Review → Progress), with distinct child and parent value, companions framed as guides (not "an AI chatbot"), trust/safety explicit, real plan data, one clear start. Proof shown visually (the loop), interaction that teaches.
3. **Navigation**: role-based entry points; each role's nav surfaces "what matters now"; never make users hunt; responsive mobile-first.
4. **Onboarding**: short, low-cognitive-load, journey-framed; guardian consent is part of the flow.
5. **Admin/CMS**: task-oriented areas with in-flow status + preview loops; restraint over density; each staff role sees only what it can act on. Moderator gets its own console, not an admin clone.
6. **Accessibility + a11y and motion-with-purpose** are landing-grade concerns from the first page, reduced-motion respected.

Content was rephrased for compliance with licensing restrictions.


---

# ADDENDUM — Freshness audit + gap-fill (2026-10-02)

> Audit of the sections above against the current rebuild's actual needs.
> Original research (above) covers EdTech landing, onboarding, and role-based
> dashboards/admin at a general level — still valid, no retraction needed. This
> addendum fills categories the reconciliation pass (ledger 88, 2026-10-02)
> showed were under-researched relative to what's actually being built:
> character/companion presence (Landing's biggest flagged gap), parent
> progress-monitoring dashboards specifically, moderation-queue UX (now that
> `/mod/escalations` and `/mod/community` have real, fixed API wiring), and
> project/credential evidence UX (now that `/app/projects/:id` and
> `/app/credentials` are real surfaces). Sources dated 2025-2026, paraphrased
> per licensing (no >30 consecutive words from any one source).

## D. Character / AI companion presence (fills the gap behind Landing's biggest flaw)

| Ref | What works | Pattern to learn | Fit for USAM | Do NOT copy |
| --- | --- | --- | --- | --- |
| [dev.to — Duolingo-style mascot UX](https://dev.to/uianimation/building-duolingo-style-ai-mascot-animations-with-rive-2446) | A companion mascot is a state-driven character, not a decorative animation: idle/listening/thinking/talking/encouraging-or-correcting are the real states a UI must express | Treat the mascot as a state machine the product drives, not a static logo | USAM already has this exact state set modeled in the legacy `CharacterFace` component (idle/listening/thinking/speaking/encouraging/celebrating/error) — reuse the *concept*, not necessarily the old file | Treating the character as a one-off hero image with no state behavior |
| [uianimation/medium — why apps need mascots](https://uianimation.medium.com/why-apps-games-need-mascots-micro-interactions-and-ai-companions-and-how-rive-makes-it-74005b7ddd2a) | A mascot can turn onboarding into something memorable; a companion gives the product personality and guides users in real time | The companion should be present at the moments that matter (onboarding, home, first mission), not just decorative on the landing hero | Azouz (and the domain mentors) should visibly guide onboarding + home + mission start, not just appear once on `/` | A mascot that only exists as a static landing illustration |
| [arxiv — Disney-animation-derived child AI design heuristics](https://arxiv.org/pdf/2504.08670v1) | Six developmentally-appropriate heuristics for child-facing AI: emotional expressiveness + visual clarity, audiovisual synchrony, sidekick-style personas, support for symbolic/imaginative play, predictable scaffolded interaction | Children read emotional expressiveness and a "sidekick" framing (not an authority-figure framing) as safe and legible | USAM's companions (Luma/Codey/Nova/Adam/Azouz) should read as sidekicks who help, not as teachers who grade | An AI companion framed as an evaluator/examiner |
| [arxiv — principles of safe AI companions for youth](https://arxiv.org/html/2510.11185v1) | Youth AI companions need explicit developmental safeguards; current platforms under-protect against harmful normalization | Safety framing must be visible wherever a child can converse with a companion, not just in a buried privacy page | Any character chat surface (currently a ledger gap — companions can't be chatted with yet) must ship with visible safety framing from day one, not bolted on later | Shipping companion chat before the safety framing is designed |

**Decision**: Landing's current "Companions" section (a lucide `Users` icon in a
circle + two lines of copy) fails every reference above — it has zero
character presence despite USAM owning a 15-character roster concept. This is
now the primary evidence behind the Landing rebuild in ledger 88/task 6: the
hero and companions section must show actual character presence (illustration,
name, personality), not an icon standing in for "there are companions."

## E. Parent / guardian progress-monitoring dashboards

| Ref | What works | Pattern to learn | Fit for USAM | Do NOT copy |
| --- | --- | --- | --- | --- |
| [rocket.new — parental controls dashboard](https://www.rocket.new/blog/how-to-build-parental-controls-dashboard-into-mobile-app) | A parental dashboard's core feature set is: screen-time limits, content filters, activity reports, override-request flows — managed from a linked parent account | Structure `/parent/child/:id` around those four pillars, not a generic analytics grid | USAM's `parents` module already has time-limits + activity + safety endpoints — map the UI to this exact pillar structure instead of an ad-hoc stat layout | A dashboard that mixes screen-time controls into the same visual grammar as achievement stats |
| [uxpin — progress tracker design](https://www.uxpin.com/studio/blog/design-progress-trackers/) | Good progress trackers set clear expectations and avoid ambiguous states | Mastery/progress for a parent audience should read in plain language (not raw backend enums), consistent with the design system's "child-language rule" extended to parent copy too | `/parent/child/:id` progress section should use the same `masteryLabel` mapping layer already used learner-side, not a parallel parent-only vocabulary | Showing parents a different, inconsistent progress vocabulary than the learner sees |

## F. Moderation queue UX (now directly relevant — `/mod/escalations`, `/mod/community` have real, fixed wiring this pass)

| Ref | What works | Pattern to learn | Fit for USAM | Do NOT copy |
| --- | --- | --- | --- | --- |
| [moderationapi.com — review queue design](https://docs.moderationapi.com/review-queues/using-queues) | A good queue shows volume-over-time, resolved vs pending visually, and lets a reviewer approve/reject/escalate with a clear per-item decision trail | Give `/mod/escalations` and `/mod/community` a lightweight at-a-glance summary (open vs resolved count) above the raw list — the backend's `stats/summary` endpoint already supports this | `EscalationsPage` already calls `moderationApi.stats` in principle (per ledger, confirm wiring) — surface it as a small summary strip, not just a flat list | Building a dense analytics chart when a 2-3 number summary is enough |
| [arxiv — modqueue diversity of moderator objectives](https://arxiv.org/pdf/2409.16840) | Moderators value more than throughput — fairness, accuracy, and resistance to workflow-disrupting features all matter; no single objective dominates | A resolve action should never be a single irreversible click without context — a real decision dialog (resolution type + required note) is correct, not over-engineering | This directly validates the B2 fix shipped this pass (a real resolve dialog with required note) — keep that pattern, don't simplify it back to one-click | A one-click "resolve" with no record of why |
| [appmaster.io — moderation queue design at scale](http://www.appmaster.io/blog/content-moderation-queue-design) | Consistent statuses, evidence capture, reviewer notes, and restore/appeal flows keep a queue usable as it grows | Every quarantined item needs visible evidence (the flagged content/reason) before a decision, which `CommunityModerationPage` already shows — keep this, extend with reviewer notes on reject (backend supports `notes` on review) | Add an optional notes field to the reject action in `CommunityModerationPage` (backend `dto.notes` is already accepted, currently unused frontend-side) | Hiding the flagged content and asking the moderator to decide blind |

## G. Credentials / evidence / portfolio UX for learners

| Ref | What works | Pattern to learn | Fit for USAM | Do NOT copy |
| --- | --- | --- | --- | --- |
| [Open Badges 3.0 standard overview](https://www.pok.tech/en/digital-credentials/open-badge-3-0) | A verifiable credential bundles issuer, criteria, evidence, and a public verification link | USAM's `/verify/:uid` public page + `credentials.me`/`credentials.verify` already match this model — keep it, make sure the credential card shows criteria/evidence, not just a badge image | Backend `CredentialDefinition`/`Credential` models already carry this; ensure `CredentialsPage` surfaces the *evidence* behind each credential, not just a visual badge | A badge with no visible evidence or criteria (defeats the "evidence-based" product promise) |
| [verifyed.io — student digital badges](https://www.verifyed.io/blog/student-digital-badges) | Digital badges work best as proof tied to a specific completed body of work, shareable and checkable by a third party | A learner's portfolio (`/app/portfolio`) should link each credential back to the project/mission evidence that earned it | `PortfolioPage` and `CredentialsPage` are currently separate, disconnected surfaces — consider a visible cross-link (ledger item for task 9) | A credential wall disconnected from the actual project work |

## Updated decisions feeding implementation (supersedes nothing above, adds to it)

7. **Character presence is a hard requirement for Landing's hero and
   companions section**, not an optional illustration — this is the direct,
   evidence-backed reason the current Landing is being rebuilt in task 6.
8. **Moderation surfaces keep the "real decision dialog" pattern** (resolution
   type + required note) already shipped this pass; extend reject-with-notes
   on community moderation using the backend's existing `notes` field.
9. **Parent dashboard structure = screen-time / content-safety / activity /
   override**, not a generic analytics-card grid — re-audit `/parent/child/:id`
   against this pillar structure in task 10.
10. **Credentials must show evidence/criteria, not just a badge graphic** —
    carry into the Guardian/Learner credential work in tasks 9-10.

Content was rephrased for compliance with licensing restrictions.
