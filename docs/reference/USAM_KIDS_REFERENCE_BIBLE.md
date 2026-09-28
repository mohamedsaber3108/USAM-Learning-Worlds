# USAM for Kids — Reference Bible (in-repo)

> Repo-resident copy of the mandatory research/decision framework so it is
> version-controlled and available to future agents. This is the **framework**,
> not a shopping list. For every subsystem, follow:
>
> `SEARCH → READ → COMPARE → LICENSE CHECK → MAINTENANCE CHECK → SECURITY CHECK → POC/BENCHMARK → DECIDE → IMPLEMENT → VERIFY`
>
> Allowed decisions: `ADOPT · ADOPT+CUSTOMIZE · REFERENCE · POC_FIRST · KEEP · REPLACE · BUILD · REJECT · RESEARCH_MORE`. Never decide by GitHub stars alone.

Applied decisions live in `docs/research/OSS_DECISION_MATRIX.md`. The full external
research corpus this file distills already exists across `docs/audit/*` and
`docs/architecture/*` — reconcile, do not duplicate.

---

## 0. Non-negotiable directive
The current frontend is **legacy implementation, not the target**. The final
frontend is derived from product requirements, child journeys, learning science,
age adaptation, current backend capabilities, the final feature/engine inventory,
competitor research, design research, accessibility/child-safety, and production
constraints — **not** from the current pages. Deletion is authorized where it is
the strongest solution, but **no required feature or backend capability may
disappear**; every removed implementation maps to its replacement (§35).

## 1. Decision-matrix fields (per candidate)
project · repo/docs · problem solved · USAM engine mapped · maintenance · latest
release · license · commercial-use · redistribution · attribution · trademark ·
security · open issues · platform support · self-host needs · child-safety ·
performance · integration complexity · maintainability · current overlap ·
migration cost · alternatives · POC result · **final decision**. Classify
open-source vs source-available vs open-core vs free-tier correctly.

## Section pointers (external references — see the source doc for URLs)
- §2 Product/UX/competitor references (Duolingo, Khan Kids, Scratch, Code.org, Brilliant, Lingokids, Prodigy, Tynker, PBS Kids, LEGO Education, NatGeo Kids, EWA). → `docs/research/COMPETITOR_UX_RESEARCH.md`.
- §3 Child UX/accessibility (NN/g, Apple HIG, Material 3, W3C WAI, WCAG, ARIA APG). → age-band UX rules in `docs/product/USAM_KIDS_PRODUCT_BIBLE.md` + `docs/frontend/USAM_DESIGN_SYSTEM.md`.
- §4 Design-system foundations (React, TS, Tailwind, shadcn/ui, Radix, React Aria, Lucide, Motion). → `docs/frontend/USAM_DESIGN_SYSTEM.md`.
- §5 Motion/characters/2D/3D (Rive, Lottie, Motion, GSAP, Three/R3F, Pixi, Phaser, Babylon, Godot, GDevelop).
- §6 Learning science (UNESCO, UNICEF, OECD, Cambridge, Oxford; mastery/retrieval/spacing/interleaving/worked-examples/scaffolding/ZPD/cognitive-load/formative/feedback/metacognition/PBL/transfer/self-direction/motivation). → `docs/research/LEARNING_SCIENCE_REFERENCES.md`.
- §7 Curriculum/skill-graph/learner-state/adaptive (FSRS, BKT/DKT, KST, IRT/CAT). Hybrid `Evidence+Mastery rules+Knowledge graph+Spaced review+Adaptive recommendation+AI explanation`, NOT LLM-only mastery.
- §8 Standards (xAPI, cmi5, Caliper, Open Badges, LTI, OneRoster; LRS/Ralph). Interoperability references.
- §9 English engine (WordNet, Wiktionary, ConceptNet, UD, CMUdict, LanguageTool; Gutenberg/Wikisource/LibriVox/Commons/Openverse/Archive/Common Voice; Whisper/faster-whisper/WhisperX/MFA/phonemizer/eSpeak-NG). → `docs/research/ENGLISH_DATA_SOURCE_REGISTRY.md`.
- §10 Coding engine (Blockly, Scratch[copyleft/trademark caution], Monaco, CodeMirror, Pyodide, JupyterLite, Sandpack, WebContainers[commercial], Judge0[GPL]/Piston/nsjail/gVisor/Firecracker). **Never run untrusted child code in the primary backend process.**
- §11 AI-as-subject (UNESCO AI competency, Code.org AI, Elements of AI).
- §12 AI orchestration/RAG (LangGraph, LlamaIndex, Haystack, Semantic Kernel, LiteLLM; pgvector/Qdrant/Weaviate/Milvus/OpenSearch; Meilisearch/Typesense). Decide: does USAM need a dedicated vector DB or is pgvector enough?
- §13 Voice/realtime (LiveKit, Pipecat, WebRTC; Whisper family, sherpa-onnx, Vosk; Piper/Coqui/Kokoro/eSpeak; Moshi). Benchmark **Egyptian-Arabic child speech** separately. → `docs/research/VOICE_BENCHMARK.md`.
- §14 Character/companion engine (single configurable framework; roster incl. Azouz/Zein/Luma/Codey/NOVA/Mira/Rami/Faris/Tala/Adam/Byte/Nour/Rex/Zara/Atlas). Characters never encourage secrecy/dependency/isolation.
- §15 Story/branching (Ink, Yarn Spinner, Twine). §16 Interactive content/authoring (H5P; Tiptap/ProseMirror/Lexical/Editor.js). §17 Creative canvas (Excalidraw, tldraw, Fabric, Konva, Tone.js, Howler).
- §18 Science/STEM (MicroPython, Arduino, micro:bit). §19 Entrepreneurship (project/simulation-driven). §20 Gamification (XP/badges/quests; **rewards ≠ mastery**, no FOMO/toxic leaderboards/spending pressure).
- §21 Child/AI safety (NeMo Guardrails, PurpleLlama, Presidio, OPA, Guardrails AI; COPPA/GDPR-K/UK Children's Code/Egypt/Saudi — classify APPLIES/MAY_APPLY/DOES_NOT/LEGAL_REVIEW).
- §22 Identity/authz (Keycloak/Authentik/Ory/Zitadel; OpenFGA/OPA/Casbin). §23 DB/cache/storage/messaging (Postgres+pgvector; Valkey/Redis; MinIO/S3; NATS/RabbitMQ/Kafka/BullMQ; Temporal). §24 Notifications (Novu). §25 Analytics/flags/observability (PostHog; Unleash/OpenFeature; OpenTelemetry/Prometheus/Grafana/Loki/Jaeger; Sentry[source-available]). §26 Security (OWASP ASVS/Top10/ZAP, Semgrep, Trivy, Renovate, Syft/Grype, Gitleaks; OpenBao/SOPS/Infisical). §27 Media (FFmpeg/Sharp/ImageMagick/ClamAV/Video.js/Plyr/Remotion). §28 Collaboration (Yjs/Automerge). §29 Testing (Vitest/Testing Library/Playwright/Storybook/axe-core/k6/Lighthouse). §30 i18n/RTL (i18next/FormatJS).
- §31 Admin/CMS ops. §32 Pricing/packaging (`Product→Package→Plan→Entitlement→Subscription→Child Access`). §33 Final page inventory (public/child/parent/admin). §34 16 pre-code research artifacts. §35 delete/replace criteria. §36 engine connection truth table. §37 production gate. §38 required outputs. §39 execution sequence.

## Execution sequence (§39)
`RECONCILE AUDITS → REFERENCE BIBLE → RESEARCH GAPS → FINAL PRODUCT MODEL → PAGE/FLOW INVENTORY → DESIGN SYSTEM → DELETE/REPLACE BAD FRONTEND → REBUILD FROM ZERO → CONNECT BACKEND → VERIFY → TEST → QA → PRODUCTION GATE`

> This repo already contains the reconciled audits (`docs/audit/*`, `docs/platform-audit/CURRENT_PLATFORM_AUDIT.md`) and the live execution tracker (`plans-local/STATUS.md`). Continue phase-by-phase; stop only for genuine external blockers (credentials, legal/commercial, irreversible product decisions).
