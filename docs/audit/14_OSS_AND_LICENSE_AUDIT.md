# 14 — OSS & License Audit

**Discipline (from `repos.md`):** for every subsystem — search → discover → compare (2–5) → verify license → maintenance → security → architecture fit → POC → decision. Never pick by GitHub stars; never adopt blindly; never build commodity infra we can buy/adopt; never weaken safety/security/license.

**Decision verbs:** ADOPT · ADOPT+CUSTOMIZE · USE_AS_REFERENCE · POC_FIRST · KEEP_CURRENT · REPLACE_CURRENT · REJECT · RESEARCH_MORE.

> Licensing/maintenance below verified via web search on 2026-09-10. Deeper per-candidate POC + full comparison of 2–5 alternatives each remains **research work** → `17_RESEARCH_BACKLOG`. This file records the initial, evidence-backed decisions and the critical license flags.

## Decisions matrix (initial)

| Subsystem | Requirement | Current in USAM | Candidate(s) | License (verified) | Provisional decision |
|---|---|---|---|---|---|
| Realtime voice | USAM-VOICE-001/004 | voice module + ASR/TTS sidecars (turn-based) | **LiveKit Agents**, Pipecat, Moshi | LiveKit Agents **Apache-2.0**, self-hostable | POC_FIRST (LiveKit primary vs Pipecat) |
| STT | USAM-VOICE-003 | sidecar | Whisper, sherpa-onnx/SenseVoice | permissive | POC_FIRST — **must benchmark Egyptian-Arabic child speech** |
| TTS | USAM-VOICE-003 | sidecar | Piper successor, XTTS-type, Inworld | mixed | RESEARCH_MORE — Egyptian-Arabic quality is the deciding factor |
| Vector search | USAM-RAG-001/002 | Postgres full-text only (no vectors) | **pgvector** vs Qdrant | both OSS | ADOPT pgvector first (already on Postgres); Qdrant only if scale/latency outgrows it. 2026 consensus: "add pgvector before adopting a new service" for <10M vectors |
| Spaced repetition | USAM-REV-001/002 | naive fixed-bucket scheduler | **FSRS** (open-spaced-repetition, v6) | permissive OSS | ADOPT+CUSTOMIZE — replace naive scheduler with a real FSRS port |
| Visual coding | USAM-CODE-002 | **missing** | **Blockly** (Google) | **Apache-2.0**, actively maintained | ADOPT — for 8–9/10–11 block coding → generated JS/Python |
| Code execution | USAM-CODE-004/005 | Pyodide/Sandpack present | Pyodide, JupyterLite, Monaco | permissive | KEEP_CURRENT + **REQUIRES_SECURITY_REVIEW** (sandbox isolation, resource limits) |
| AI guardrails | USAM-SAFE-006 | custom moderation (Presidio+Bedrock) | **NeMo Guardrails** (Apache-2.0), LlamaFirewall | Apache-2.0 | USE_AS_REFERENCE / POC_FIRST — keep custom child-safety policy; evaluate NeMo for injection/jailbreak layer. **Do not weaken the existing fail-closed moderation.** |
| Analytics | USAM-ANALYT-006 | analytics module + pino + feature flags | **PostHog**, Sentry, Unleash, OpenTelemetry | PostHog self-host **MIT (no scale guarantee)**; **Sentry self-host = FSL (fair-source, NOT OSI open-source, converts to Apache-2.0 after 2y, cannot resell as a service)** | RESEARCH_MORE — the Sentry FSL distinction matters for a commercial product; prefer OpenTelemetry + self-hosted stack, evaluate PostHog Cloud vs hobby |
| Authorization | USAM-IDN-006 | Nest guards + role checks | OpenFGA, OPA, Keycloak | OSS | RESEARCH_MORE — current role guard may suffice for V1; fine-grained (OpenFGA) only if parent/teacher/org sharing grows |
| Interactive content | USAM-CMS-006 | none | H5P | mixed (MIT core + content-type licenses vary) | RESEARCH_MORE — verify per-content-type licenses before embedding |
| Learning analytics standard | USAM-OSS-002 | LearningEvent model | xAPI 2.0, Caliper, LRS (Ralph/ADL) | open standards | USE_AS_REFERENCE — align LearningEvent to xAPI vocabulary rather than adopt a full LRS now |
| Animation | USAM-AVATAR-003 | framer-motion SVG (CharacterFace) | Rive, Lottie | permissive | KEEP_CURRENT — bespoke SVGs are working; revisit only for richer avatars |

## Critical license flags (do not miss)

1. **Sentry self-hosted is FSL, not OSI open source.** For a commercial product this is a real compliance consideration — record before adoption. OpenTelemetry (Apache-2.0) is the safe instrumentation standard regardless.
2. **PostHog self-host (MIT) is explicitly "provided without guarantee" and not built to scale past a few 100k events** on a single machine — plan for PostHog Cloud or a scaled deployment, don't assume the hobby image is production-grade.
3. **`ai-child` reference repo** (per `repos.md`) self-describes as a prototype, not a safety certification — USE_AS_REFERENCE only; never treat as child-safety compliance.
4. **Scratch:** if any future coding work targets Scratch, use the current maintained Scratch ecosystem, **not** the archived standalone `scratch-vm`.

## Status

USAM-OSS-001: **REQUIRES_RESEARCH** (discipline defined here; full per-candidate POC/comparison is backlog). USAM-OSS-002 (standards): **RESEARCH_MORE**. No OSS has been adopted or installed in this audit phase.
