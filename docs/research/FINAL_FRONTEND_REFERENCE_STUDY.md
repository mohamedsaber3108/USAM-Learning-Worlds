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
