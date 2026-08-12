# USAM Open-Source Evaluation

**Date:** 2026-08-12
**Phase:** Educational Core Foundation

---

## Evaluation Framework

For each candidate:
- **Fit:** Does it solve a real USAM problem?
- **License:** Compatible with proprietary product?
- **Maturity:** Active maintenance? Community?
- **Integration Cost:** How hard to integrate?
- **Child Safety:** Any concerns?

---

## 1. Spaced Repetition

### FSRS (Free Spaced Repetition Scheduler)
- **Decision:** USE AS REFERENCE ✓ (already done)
- **Current Status:** The mastery-confidence.algorithm.ts is INSPIRED by FSRS concepts (forgetting curve, spacing effect, stability)
- **What we took:** Ebbinghaus forgetting curve, interval scheduling, confidence-based review timing
- **What we didn't take:** Full FSRS parameter optimization (too complex for children's irregular practice patterns)
- **Why not full adoption:** FSRS assumes deliberate flashcard-style review. USAM's evidence comes from diverse sources (activities, projects, conversations), not just recall cards.

---

## 2. Knowledge Graphs

### Neo4j / Graph Databases
- **Decision:** DEFER
- **Reason:** Current prerequisite needs are well-served by PostgreSQL with a self-referential table. Graph DB adds operational complexity (separate service, connection pooling, query language) without proportional benefit at current scale.
- **When to reconsider:** If the curriculum exceeds ~5000 concepts with complex multi-hop dependency queries.

### Alternative: PostgreSQL recursive CTEs
- **Decision:** ADOPT
- **Reason:** PostgreSQL supports recursive queries for tree/graph traversal. Prisma supports raw queries. No new infrastructure needed.

---

## 3. Coding Education

### Scratch VM / Scratch Blocks
- **Decision:** DEFER (future phase)
- **License:** BSD-3-Clause ✓
- **Fit:** Excellent for ages 8-11 visual programming
- **Integration:** Heavy — requires iframe or web worker, custom project save/load
- **When:** When visual programming becomes a priority feature

### Blockly (Google)
- **Decision:** DEFER (future phase)
- **License:** Apache-2.0 ✓
- **Fit:** Good for transitional blocks-to-text
- **Integration:** Moderate — embeddable, well-documented
- **When:** After Scratch, as transition layer

### Pyodide (Python in WebAssembly)
- **Decision:** DEFER (future phase)
- **License:** MPL-2.0 ✓
- **Fit:** Excellent for ages 12-14 Python learning
- **Integration:** Frontend-only (WASM), no server execution needed
- **Child Safety:** Runs in browser sandbox — safe ✓
- **When:** When Python curriculum is built

### Monaco Editor / CodeMirror
- **Decision:** ADOPT (when code editor needed)
- **License:** MIT ✓
- **Fit:** Code editing UI component
- **Note:** Frontend dependency, not backend

### Sandpack (CodeSandbox)
- **Decision:** EVALUATE for web dev (HTML/CSS/JS)
- **License:** Apache-2.0 ✓
- **Fit:** Excellent for web development learning (ages 12-14)
- **Integration:** React component, sandboxed execution
- **Child Safety:** Sandboxed ✓

---

## 4. AI / LLM

### Current: AWS Bedrock (Claude 3.5 Sonnet)
- **Decision:** KEEP as primary, but WRAP behind abstraction
- **Reason:** Already working, good for educational content. But must not be hardcoded everywhere.

### LiteLLM
- **Decision:** EVALUATE for provider abstraction
- **License:** MIT ✓
- **Fit:** Unified API across 100+ LLM providers
- **Integration:** Python (would need separate service or Node equivalent)
- **Alternative:** Build lightweight NestJS provider interface (lower complexity)
- **Verdict:** BUILD OWN ABSTRACTION (simpler for Node.js stack)

### LangGraph / LangChain
- **Decision:** REJECT for now
- **Reason:** Adds Python dependency, heavy abstraction layer, complexity not justified for current use cases (4 AI functions). If agent orchestration becomes complex later, reconsider.
- **Alternative:** Simple prompt templates + structured output in TypeScript

### Ollama (Local Models)
- **Decision:** DEFER
- **Reason:** No immediate need for local inference. Bedrock handles all current use cases. May be useful for development/testing without API costs later.

---

## 5. Voice

### Whisper (OpenAI STT)
- **Decision:** EVALUATE (future phase)
- **License:** MIT ✓
- **Fit:** Excellent STT for English pronunciation assessment
- **Integration:** API or self-hosted
- **Note:** Arabic STT quality varies — need to test

### ElevenLabs / PlayHT / Azure TTS
- **Decision:** EVALUATE (future phase)
- **Reason:** Character voices need personality. Azure has Arabic support.
- **Child Safety:** Voice cloning must be prevented

### Web Speech API (Browser)
- **Decision:** USE as MVP fallback
- **Reason:** Free, no API needed, decent for English. Limited Arabic.
- **Integration:** Frontend-only

---

## 6. Analytics & Observability

### PostHog / Mixpanel
- **Decision:** DEFER
- **Reason:** Custom learning events > generic product analytics for USAM. Build internal event system first. Can export to PostHog later.

### Sentry
- **Decision:** ADOPT (env var already exists: SENTRY_DSN)
- **License:** BSL/MIT ✓
- **Fit:** Error tracking in production
- **Integration:** Simple SDK install

### OpenTelemetry
- **Decision:** ADOPT (env var exists: OTEL_EXPORTER_OTLP_ENDPOINT)
- **License:** Apache-2.0 ✓
- **Fit:** Distributed tracing for debugging
- **Integration:** NestJS has official OTEL support

---

## 7. Database / Search

### pgvector (PostgreSQL)
- **Decision:** DEFER
- **Reason:** Vector search useful for semantic content matching (finding similar activities). Not needed until content library is large.

### Meilisearch / Typesense
- **Decision:** DEFER
- **Reason:** Full-text search needed eventually for content discovery. PostgreSQL full-text search sufficient for MVP.

---

## 8. Real-time

### Socket.io / ws
- **Decision:** DEFER
- **Reason:** No real-time features in current phase. Needed for voice, collaboration, live challenges later.

---

## 9. Content Management

### Strapi / Directus
- **Decision:** REJECT
- **Reason:** USAM's content model is too specialized (objectives, age variants, mastery thresholds) for generic CMS. The Prisma schema IS the content model.

---

## Summary Table

| Technology | Decision | Phase |
|-----------|----------|-------|
| FSRS concepts | ADOPTED (reference) | Done |
| PostgreSQL recursive CTEs | ADOPT | Current |
| Scratch VM | DEFER | Future |
| Blockly | DEFER | Future |
| Pyodide | DEFER | Future |
| Monaco/CodeMirror | ADOPT when needed | Future |
| Sandpack | EVALUATE | Future |
| AWS Bedrock | KEEP + WRAP | Current |
| LiteLLM | REJECT (build own) | Current |
| LangGraph | REJECT | — |
| Whisper | EVALUATE | Future |
| Web Speech API | USE as MVP | Future |
| Sentry | ADOPT | Current |
| OpenTelemetry | ADOPT | Current |
| pgvector | DEFER | Future |
| Socket.io | DEFER | Future |
| Strapi/Directus | REJECT | — |
