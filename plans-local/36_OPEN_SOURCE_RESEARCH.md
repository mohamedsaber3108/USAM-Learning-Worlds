# 36 — OPEN-SOURCE RESEARCH (continuous, per directive §33)

> For each subsystem: SEARCH → DISCOVER → COMPARE → LICENSE → MAINTENANCE →
> SECURITY → FIT → POC-IF-NEEDED → DECIDE. Decision labels: ADOPT / ADOPT+
> CUSTOMIZE / REFERENCE ONLY / POC FIRST / KEEP CURRENT / REPLACE / REJECT /
> RESEARCH MORE. This is a living doc; revisit per subsystem as gates proceed.

Date: 2026-09-30

---

## 1. Spaced repetition scheduler — DECIDE: ADOPT (`ts-fsrs`)

Current: backend uses a **custom FSRS-INSPIRED heuristic**
(`mastery-confidence.algorithm.ts`) — not the real algorithm.
Candidates:
- **`open-spaced-repetition/ts-fsrs`** — TypeScript-native, ESM/CJS/UMD, the
  reference FSRS implementation from the OSR community. [GitHub](https://github.com/open-spaced-repetition/ts-fsrs).
- `fsrs` (PyPI, **MIT**) — Python reference. [PyPI](https://pypi.org/project/fsrs/2.1.1/).
License: MIT (OSR projects). Maintenance: active, academically backed.
Fit: backend is TS (Nest) → `ts-fsrs` drops in. **Decision: ADOPT `ts-fsrs`** for
`FlashcardReview` + competency review scheduling; keep the custom confidence model
for the *mastery-state* decision, use FSRS for the *when-to-review* decision.
POC: wrap `ts-fsrs` behind the existing review-scheduling interface; A/B vs
current heuristic via the `experimentation` module. (RESEARCH MORE on optimizer.)

## 2. Coding execution sandbox — DECIDE: KEEP CURRENT (already in stack)

Root `src/` already ships **Pyodide** (`pyodide`) + **Sandpack**
(`@codesandbox/sandpack-react`). Backend has `coding-sandbox` module. Pyodide =
Python-in-WASM (client, safe, no server exec); Sandpack = JS/web sandbox.
**Decision: KEEP CURRENT** — reuse the proven Pyodide/Sandpack combo + server
re-validation (the "coding trust loop"). No new dependency. Verify the server
re-validation path in G4 (coding security threat model — prior doc 75).

## 3. Voice (STT/TTS) — DECIDE: POC FIRST (provider-independent)

Current: backend `voice` module exists; provider depth unverified. Requirement:
provider-INDEPENDENT (directive §20), EG-Arabic child-speech benchmark.
Approach: define a `VoiceProvider` interface (like the existing payment
abstraction) with pluggable STT/TTS. Candidate providers to POC (license/cost/
Arabic quality to compare in G4): cloud (Azure/Google/OpenAI/ElevenLabs) vs OSS
(Whisper for STT, Coqui/Piper for TTS). **Decision: POC FIRST** — interface now,
provider bake-off in G4; EG-Arabic child-speech accuracy is the gating metric.
Do NOT hardcode a vendor.

## 4. CEFR / English content — DECIDE: ADOPT+CUSTOMIZE (open descriptors)

Use open CEFR / Global-Scale-of-English young-learner descriptors as the skeleton
for English objectives (pre-A1→B1 for 8–14). [CoE young-learner mapping](https://midiasstoragesec.blob.core.windows.net/001/2018/10/cefr-mapping-descriptors-young-learners-11-15y_may2016-doc1_.pdf).
Content itself = USAM original + openly-licensed + controlled AI generation
(directive §32). **Decision: ADOPT+CUSTOMIZE** the descriptor framework; author
content under the provenance pipeline (ContentSource/ContentLicense exist).

## 5. CT / CS standards — DECIDE: REFERENCE ONLY

Use **ISTE CT pillars** (decomposition, pattern recognition, abstraction,
algorithms) and **CSTA PK-12 standards** as the competency map reference for
Coding. [ISTE](https://iste.org/computational-thinking), [CSTA](https://csteachers.org/pk12standards/).
**Decision: REFERENCE ONLY** — map our competencies to them; don't import a
framework as code.

## 6. AI literacy framework — DECIDE: REFERENCE ONLY (AI4K12 five big ideas)

Structure the AI domain around AI4K12's five big ideas (Perception,
Representation & Reasoning, Learning, Natural Interaction, Societal Impact) and
the K-12 components (foundational concepts, creating artifacts, interacting with
agents, ethics, human-AI relationships). [AI4K12](https://raw.githubusercontent.com/touretzkyds/ai4k12/master/documents/Touretzky_Gardner-McCune_AI-Thinking_2021.pdf),
[Springer review](https://link.springer.com/article/10.1007/s41979-025-00166-z).
**Decision: REFERENCE ONLY** for the AI competency map.

## 7. Entrepreneurship framework — DECIDE: REFERENCE ONLY (design thinking)

Base the Entrepreneurship domain on **design thinking** (empathize→define→ideate
→prototype→test) framed as Problem→Idea→User→Solution→Create→Test→Improve→Value→
Pitch, mindset-over-theory. [EdTech design-thinking](https://edtech-class.com/2023/06/09/using-design-thinking-to-teach-entrepreneurship-in-the-classroom/).
**Decision: REFERENCE ONLY.**

## 8. Open items (RESEARCH MORE)

- Open Badges / verifiable credentials standard for the `Credential` model.
- Content licensing sources for English listening/reading (public-domain + CC).
- FSRS optimizer (per-learner parameter fitting) — later optimization.
