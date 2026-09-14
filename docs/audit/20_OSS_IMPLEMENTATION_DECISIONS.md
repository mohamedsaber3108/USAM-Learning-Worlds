# 20 — OSS Implementation Decisions (this build)

Researched 2026 for each subsystem being implemented. Decision verbs per `repos.md`. Only permissive/OSI licenses adopted; anything runtime-heavy is behind a provider abstraction so it can be swapped.

| Subsystem | Chosen | License | Decision | Notes |
|---|---|---|---|---|
| Spaced repetition | **`ts-fsrs`** (open-spaced-repetition) | MIT | **ADOPT** | Official org, TS-native, actively maintained, FSRS v4/5/6. Replaces the naive fixed-bucket scheduler. |
| Vector search | **pgvector** (`pgvector` ext + `pgvector` npm) | PostgreSQL/OSI | **ADOPT** | Already on Postgres — no second datastore. Falls back to existing full-text if the extension/embeddings are unavailable. |
| Embeddings | **`@xenova/transformers` (Transformers.js) `all-MiniLM-L6-v2`** (384-dim) | Apache-2.0 / MIT | **ADOPT (optional runtime)** | Local, free, no API key. Loaded lazily; if unavailable the RAG layer degrades to full-text. |
| AI model router | activate existing dead `AIProviderService.executeTask/selectModel` | in-repo | **COMPLETE** | No new dep — wire the existing router + cost/latency logging. |
| Code execution safety | **client-side Pyodide/Sandpack (already in use)** + backend submission limits | in-repo | **KEEP + HARDEN** | **Decisive research finding:** `vm2` is discontinued with critical CVEs, and `isolated-vm` had a 2026 critical sandbox-escape. In-process server-side JS sandboxing is NOT safe. Correct model: run learner code in the learner's OWN browser (Pyodide/Sandpack), never on our server; backend only validates/limits submissions. |
| Credentials | **Open Badges 3.0 shape** (W3C Verifiable Credential JSON), hand-built issuer | 1EdTech spec (open) | **ADOPT (reference impl)** | Emit OB3-compatible JSON. Full cryptographic VC signing (digitalbazaar/vc) is a later hardening step; we issue the standards-shaped credential now with a documented signing hook. |
| Visual coding | **`blockly`** (Google) | Apache-2.0 | **ADOPT** | v12+, actively maintained. Generates JS/Python for the coding engine. |
| Voice STT (EG-Arabic) | Whisper family via **provider abstraction** + benchmark harness | model-dependent | **POC/BENCHMARK** | Off-the-shelf Whisper-large-v3 EG-Arabic WER ~0.59; fine-tuned EG models (e.g. `MAdel121/whisper-small-egyptian-arabic`, `datahiveai/whisper-large-v3-ar-dialects`) roughly halve it. Decision requires a real benchmark run — we ship the harness + adapters, you run it against your audio. |
| Voice TTS | provider abstraction (Piper/XTTS/cloud) | model-dependent | **ABSTRACTION** | Interface + adapter stubs; concrete engine chosen after quality review. |
| Observability | **OpenTelemetry** (`@opentelemetry/*` SDK + auto-instrumentations) | Apache-2.0 | **ADOPT** | OSI, vendor-neutral. Deliberately **NOT Sentry** (self-host is fair-source/FSL, not OSI). Preload NodeSDK; exports to any OTLP collector. |

## Guardrails applied
- Runtime-heavy deps (Transformers.js embeddings, Whisper, TTS) are **optional and lazily loaded** behind interfaces; the app runs fully without them (graceful degradation), so a missing model never breaks a build or a request.
- No payment gateway added (per instruction) — entitlement models + provider-abstraction stubs only.
- Legal/consent: real code (consent capture, retention enforcement, export/delete); the jurisdiction matrix remains a lawyer-review artifact, not a fabricated compliance claim.
