# USAM Kids — OSS / Technology Decision Matrix

> Consolidated ADOPT/KEEP/REPLACE/REJECT decisions per subsystem, per Reference
> Bible §1/§38. **Reconciles** the existing research in `docs/audit/20_OSS_IMPLEMENTATION_DECISIONS.md`
> and `docs/architecture/USAM_OSS_INTEGRATION_PLAN.md` (both current and verified)
> with the verified current stack and the frontend-rebuild subsystems the Bible adds.
> Decisions are grounded in what is already installed + those prior audits; net-new
> rows are flagged `NEW`. License/commercial notes come from the cited prior audits.

Date: 2026-09-23 · HEAD `aa2cd67`

Legend: **KEEP** (in use, correct) · **ADOPT** (bring in) · **REPLACE** · **REJECT** ·
**POC** (benchmark before commit) · **ABSTRACTION** (behind provider seam) · **REFERENCE** (pattern only).

---

## A. Frontend platform (the rebuild target)

| Subsystem | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| UI framework | **KEEP** | React 18 + TypeScript + Vite | In use, correct, matches Bible §4. No reason to churn the framework; the *experience* is being rebuilt, not the toolchain. |
| Styling / tokens | **KEEP** | Tailwind CSS + `styles/index.css` token layer | Bible §4 endorses Tailwind. Keep the token layer; **REPLACE** the visual language (see `USAM_DESIGN_SYSTEM.md`). |
| Accessibility primitives | **ADOPT (NEW)** | **Radix UI** (or React Aria for complex widgets) | Bible §4 mandates an explicit primitive/accessibility layer. Current app hand-rolls interactive components; adopting Radix for menus/dialogs/tabs/tooltip closes real a11y gaps (keyboard, focus, ARIA) the axe gate can't fully cover. Introduce incrementally during the rebuild. |
| Component ownership | **ADOPT (NEW)** | **shadcn-style owned components** on Radix + Tailwind | Bible §4: "USAM design system, not a default library theme." Own the code (copy-in), not a themed dependency, so the child-first visual language is fully controllable. |
| Icons | **KEEP** | Lucide (`lucide-react`) | In use; Bible §4 endorses. |
| Motion | **KEEP** | framer-motion (Motion) | In use; Bible §4/§5 endorse for character/reward/progress motion. Respect `prefers-reduced-motion`. |
| Forms | **KEEP** | react-hook-form + zod | In use; correct. |
| Data/state | **KEEP** | TanStack Query (server) + Zustand (local) | In use; correct server-cache + light client-state split. |
| i18n / RTL | **KEEP** | i18next + `dir`/`lang` mirroring | In use, real RTL layout mirror (Bible §30). |
| Routing | **KEEP** | React Router 6 | In use. Rebuild re-authors the *route map*, not the router. |

## B. Motion / characters / games (per-use-case, Bible §5)

| Use case | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| Character idle/speak/listen/think states | **POC (NEW)** | **Rive** (preferred) or Lottie | Rive supports state machines (idle→speaking) ideal for companion states; Lottie is simpler but less interactive. POC one character before rostering all 15. Falls back to the current programmatic `CharacterFace` if neither lands. |
| Reward / progress animations | **KEEP** | framer-motion + Lottie for celebratory moments | Current celebration overlay works; Lottie only where a richer burst is justified. |
| World map | **KEEP/CUSTOM** | Canvas/SVG + framer-motion | Current World Journey strip is SVG/CSS. A full map is 2D SVG/Canvas, not 3D. **REJECT 3D (Three/Babylon)** for the map — unjustified perf cost on kids' devices. |
| Mini-games / simulations | **REFERENCE** | Phaser / PixiJS per game, only when a game needs a game loop | Do not adopt a game engine platform-wide. Evaluate per interactive experience. |
| 3D | **REJECT (for now)** | — | No current requirement justifies R3F/Three/Babylon; revisit only for a specific 3D experience with a perf budget. |

## C. Coding engine (Bible §10) — SECURITY-CRITICAL

| Subsystem | Decision | Choice | Rationale (from `docs/audit/20` + OSS integration plan, verified) |
| --- | --- | --- | --- |
| Python execution | **KEEP** | **Pyodide** (in-browser WASM) | Kids' code runs in the learner's OWN browser, never our backend. MPL-2.0. |
| JS/React execution | **KEEP** | **Sandpack** (in-browser) | Apache-2.0. Avoid Nodebox (restrictive EULA). |
| Visual coding | **KEEP** | **Blockly** (Apache-2.0) | In use; generates JS/Python. |
| Server-side sandbox | **REJECT** | ~~vm2 / isolated-vm~~ | Decisive finding: vm2 discontinued w/ CVEs; isolated-vm had a 2026 sandbox-escape. In-process server JS sandboxing is unsafe. Backend only validates/limits submissions. |
| WebContainers | **REJECT** | StackBlitz WebContainers | Commercial license required for production for-profit use. |
| Judge0 | **REJECT** | Judge0 | GPL-3.0 — copyleft risk for a commercial product; and not needed given the browser-execution model. |
| Code editor | **KEEP** | textarea today; **ADOPT CodeMirror (NEW)** when richer editing is needed | CodeMirror (MIT-friendly) over Monaco for size on kids' devices; adopt only when syntax highlighting/linting is a real requirement. |

## D. AI / RAG / voice (Bible §12/§13) — mostly ABSTRACTION

| Subsystem | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| LLM provider | **KEEP (ABSTRACTION)** | AWS Bedrock behind `AIProviderService` | In use; provider-abstracted so swappable. Runtime **⛔ unverifiable agent-side** (creds). |
| Embeddings | **KEEP** | `@xenova/transformers` MiniLM (local, lazy) | Apache-2.0/MIT; degrades to full-text if unavailable. |
| Vector search | **KEEP** | **pgvector** on existing Postgres | No second datastore. **REJECT** dedicated vector DB (Qdrant/Weaviate/Milvus) — pgvector is sufficient at current scale (answers Bible §12's explicit question). |
| Orchestration | **KEEP (in-repo)** | in-repo `AIProviderService` router | **REJECT stacking** LangGraph/LlamaIndex/Haystack — no justified need; adding them would be unjustified complexity per Bible §12. |
| STT (EG-Arabic child) | **POC** | Whisper family via provider abstraction + benchmark harness | Off-the-shelf EG-Arabic WER ~0.59; fine-tuned EG models ~halve it. Needs a real benchmark run on USAM audio. → `VOICE_BENCHMARK.md`. |
| TTS | **ABSTRACTION** | Piper/XTTS/cloud behind interface | Concrete engine chosen after quality review. |
| Realtime transport | **RESEARCH_MORE** | LiveKit vs Pipecat vs raw WebRTC | Current voice is turn-based (`/voice/turn` + sidecars). Full-duplex realtime is a later decision; keep turn-based until benchmarked. |

## E. Data / infra / observability (Bible §23/§25)

| Subsystem | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| Database | **KEEP** | PostgreSQL + pgvector | In use; correct. |
| Cache/queues | **KEEP** | Redis + BullMQ | In use. (If Redis licensing becomes a concern, **Valkey** is the drop-in per Bible §23 — REFERENCE.) |
| Object storage | **KEEP** | AWS S3 (`@aws-sdk/client-s3`) | In use; S3-compatible so portable to MinIO if self-host needed. |
| Observability | **KEEP** | OpenTelemetry (OTLP) + Pino | In use; vendor-neutral. Deliberately **NOT Sentry** (source-available/FSL, not OSI). |
| Product analytics | **RESEARCH_MORE** | PostHog (self-host OSS subset) | None installed. For ecosystem funnels (Master Page) evaluate PostHog OSS; classify OSS vs commercial features carefully. Not required for current gaps. |
| Feature flags | **KEEP** | in-repo `feature-flags` module | In use; **REJECT** external Unleash unless multi-service flag sharing is needed. |

## F. Testing / QA / security (Bible §26/§29)

| Subsystem | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| Unit/component/integration | **KEEP** | Vitest + Testing Library | In use; 23 FE tests. |
| Accessibility test gate | **KEEP** | axe-core via `vitest-axe` | Adopted this program (G-7). |
| E2E | **ADOPT (NEW)** | **Playwright** | Bible §29. No E2E today beyond integration tests. Adopt for the critical journeys during the rebuild QA phase (register→onboarding→mission→reward, login, RTL). |
| Component workshop | **POC (NEW)** | Storybook | Useful for the rebuilt design system; adopt if the component library grows enough to justify it. |
| Perf | **ADOPT (NEW)** | Lighthouse (manual) | Gate the rebuilt shell's first-load, esp. mobile with the heavy coding chunks. |
| Security scanning | **REFERENCE** | Trivy/Gitleaks/Semgrep/Renovate | Not wired to CI in-repo; recommend for the production gate. |

## G. Payments / identity / notifications

| Subsystem | Decision | Choice | Rationale |
| --- | --- | --- | --- |
| Payments | **BUILD (blocked)** | provider interface exists (`entitlements/payment`) | Real gateway (Stripe/Paymob) needs owner processor choice + keys — ⛔ external blocker (G-4 7d). |
| Identity/authz | **KEEP** | in-repo JWT + role enum | In use. **REJECT** Keycloak/Ory for now (single service; unjustified). Revisit for cross-USAM SSO (Master ecosystem). |
| Notifications | **KEEP** | in-repo `notifications` module | In use. **REJECT** Novu unless multi-channel/scale demands it. |

---

## Cross-cutting guardrails (carried from prior audits)
- Runtime-heavy deps (embeddings, Whisper, TTS) stay **optional + lazily loaded behind interfaces**; the app runs fully without them.
- **No untrusted child code on the backend.** Ever.
- **No payment gateway** without owner processor choice + keys.
- Legal/consent code is real; the jurisdiction matrix stays a lawyer-review artifact, not a fabricated compliance claim.
- Frontend framework/toolchain is **kept**; the **experience/IA/visual language** is what gets rebuilt.

## Net-new adoptions this reconstruction introduces
Radix (a11y primitives) · shadcn-style owned components · Rive/Lottie (character states, POC) · CodeMirror (when richer editing needed) · Playwright (E2E) · Storybook/Lighthouse (QA). Everything else is **KEEP** or already decided in `docs/audit/20`.
