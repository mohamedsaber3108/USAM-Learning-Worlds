USAM for Kids — Master Engine + Feature + Open-Source Inventory
(Provided by user 2026-09-02. Reference document for gap analysis — NOT a
build-everything-at-once mandate. See "Architecture Decision" section near
the end: use Tier A/B/C/D/E/F classification, and the 15 must-not-forget
core engines list, before deciding what to build next.)

================================================================================
CORE PRINCIPLE
================================================================================
Platform = Adaptive Learning + AI Companion + Learning World + Project-Based
Learning Platform for ages 8-14. NOT just an LMS/course marketplace/chatbot/
game. Entertainment is a layer ON TOP of the Educational Engine, not the
reverse.

================================================================================
THE 15 ENGINES THAT MUST NOT BE FORGOTTEN (highest priority to verify/build)
================================================================================
1. Learner Model Engine
2. Knowledge Graph Engine
3. Curriculum Engine
4. Mastery Engine
5. Adaptive Learning Engine
6. Recommendation Engine
7. Content Intelligence Engine
8. Assessment Engine
9. AI Tutor / Companion Engine
10. Character Engine
11. Voice & Conversation Engine
12. English Learning Engine
13. Project/Sandbox Engine
14. Safety & Parent Engine
15. Learning Analytics & Evaluation Engine

================================================================================
FULL ENGINE LIST (171 engines/systems total, grouped)
================================================================================
Learner & Adaptation: Learner Identity Engine, Developmental Adaptation
Engine (age 8-9 / 10-11 / 12-14 differ in voice/UI/complexity), Learner Model
Engine, Curriculum Engine (Domain->Competency->Skill->Concept->Objective->
Activity->Practice->Project->Assessment->Mastery), Knowledge Graph Engine,
Mastery Engine (BKT/DKT/IRT/Knowledge Space Theory, swappable models),
Adaptive Learning Engine, Recommendation Engine, ZPD Engine, Spaced
Repetition Engine (FSRS/SM-2), Memory Engine (episodic/semantic/working).

AI & Character: AI Tutor Engine (Socratic, grounded in content not free
chat), Multi-Agent Learning Engine (Tutor/Planner/Assessment/Curriculum/
Content/Coding/English/Creativity/Entrepreneurship/Research/Project
Reviewer/Safety/Parent/Career agents + orchestrator), AI Companion Engine
(Azouz + extensible to other characters), Character Intelligence Engine
(per-character memory/personality/relationship/emotional state, age-adapted
per child), Voice Interaction Engine (mic->VAD->ASR->intent->AI->TTS->
animation pipeline), Conversation Engine (guided/open/roleplay/debate/
interview modes).

English Learning (its own sub-platform): Vocabulary (CEFR, morphology,
collocations), Grammar (error detection, adaptive progression), Pronunciation
Engine (IPA, minimal pairs, MFA-based), Listening Engine (transcript,
shadowing, dictation), Video/Scene Engine (open/licensed/USAM-original media
only — NOT scraped copyrighted content), Story Engine (branching, age x
CEFR x skill x interest), Story Safety Engine, Reading Engine (graded A1-B2),
Writing Engine, Speaking Engine, Shadowing Engine, Dictation Engine, Visual
Language Engine, Dialogue Dataset Layer (DailyDialog/MultiWOZ/PersonaChat,
age-filtered), Corpus Engine (WordNet/Wiktionary/ConceptNet/UD — check
license before commercial redistribution).

Content Pipeline: Content Ingestion Engine (PDF/DOCX/video/audio->OCR/
transcription->chunking->knowledge graph), Content Intelligence Engine
(raw material -> lessons/quizzes/stories with human approval layer),
Assessment Engine (diagnostic/formative/summative/adaptive/project-based),
Question Engine (MCQ/fill-blank/drag-drop/speaking/coding/scenario),
Assessment Quality Engine (ambiguity/difficulty/Bloom-level auto-review).

Projects & Coding: Project-Based Learning Engine (Idea->Plan->Build->Test->
Improve->Present->Reflect), Coding Learning Engine (Blockly/Scratch for
8-11, Python/JS/React/APIs for 12-14), Coding Sandbox (Scratch VM/Blockly/
Monaco/Pyodide/JupyterLite/Sandpack/WebContainers), Code Execution Security
Engine (NEVER run child code directly on backend — sandbox + resource
limits; candidates: Piston, Judge0, WebContainers, Pyodide isolated).

World/Game/Creative: Game Learning Engine (Phaser/Godot/PixiJS, tied to
learning objectives not just fun), World Engine (dynamic "Future City" with
English Academy/Coding Lab/AI Lab/etc.), Mission Engine, Adventure Engine,
Gamification Engine (learning-first — explicitly avoid addiction loops/FOMO/
gambling mechanics), Economy Engine (avoid pay-to-win education), Character
Progression Engine, Creativity Engine (drawing/music/animation — Fabric.js/
Konva/Excalidraw/Rive/Three.js), Media Engine, Lip Sync/Character Animation
Engine (Rhubarb Lip Sync/Live2D/Rive/Blender), 3D/Spatial Learning Engine
(future: Three.js/Babylon.js/R3F for VR/AR-ready architecture), Simulation
Engine (entrepreneurship/science/digital-safety simulations).

Cross-Curricular: Entrepreneurship Engine, Financial Literacy Engine,
Critical Thinking Engine, Problem Solving Engine, Computational Thinking
Engine, Communication Engine, Collaboration Engine (Yjs/Liveblocks/WebRTC),
Community Engine (child-safe: moderated, parental controls, no unsafe DMs by
default), Competition Engine (use leaderboards cautiously — competition is
not itself a learning goal), Portfolio Engine, Career Exploration Engine
(12-14, informational not deterministic), Research Engine (sources/
citations/fact-checking), AI Literacy Engine, Digital Literacy Engine
(privacy/phishing/digital footprint).

Analytics & Learning Science: Learning Analytics Engine, Learning Science
Engine (retrieval practice, spaced practice, interleaving, scaffolding,
cognitive load, mastery learning, ZPD — the real pedagogical differentiator,
not gamification), Metacognition Engine, Reflection Engine, Motivation
Engine, Cognitive Load Engine (detect repeated errors/hesitation/rapid
skipping -> simplify/scaffold/pause), Content Recommendation Engine (learner-
model-driven, not popularity-driven).

Localization (MANDATORY per user): Localization Engine (English + Arabic,
not literal translation — Egyptian-friendly explanations, preserved English
technical terms where useful), Arabic Educational Content Engine (controlled
content, not AI-hallucinated for official curriculum), Translation Engine
(terminology glossary, contextual, bilingual UI), Pronunciation Accent
Engine, Voice Emotion/Prosody Engine (don't overclaim emotion-reading
accuracy from voice without validation).
NOTE: this maps directly to Hermes skill `usam-localization` already
authored 2026-09-02 (parity audit / bilingual content / RTL) — that skill
is Tier A, already exists, verify it gets used rather than reinvented.

Safety (MANDATORY, highest scrutiny): AI Safety Engine (input/output
moderation, jailbreak/prompt-injection protection, PII detection — see
OpenAI Guardrails as a reference architecture), Child Safety Engine (grooming
detection, unsafe-request detection, self-harm escalation, bullying,
contact/location-sharing controls — stronger than generic AI safety), Parent
Control Engine, Parent Dashboard (skills/mastery/strengths/weaknesses/
projects/engagement/safety-events, not just "hours spent"), Teacher/Mentor
Engine (human escalation layer), Notification Engine (no spam), AI Memory
Governance (every stored memory needs type/purpose/retention/permission),
AI Tool Permission Engine (explicit allow/deny list per character — e.g. no
external messaging, no arbitrary browsing), AI Hallucination Control
(RAG/grounding/citation/refusal/teacher-escalation), AI Evaluation Harness,
Red Team Engine (jailbreak/injection/unsafe-roleplay testing before any
safety-relevant release).

Infra/Platform: Search Engine (Meilisearch/Typesense/OpenSearch), RAG Engine
(hybrid dense+BM25+reranker+knowledge-graph retrieval — see Agentic-AI-Tutor
pattern), AI Model Gateway (don't hard-lock to one model — LiteLLM/vLLM/
Ollama/Bedrock-style routing; NOTE: this server already does exactly this
via Hermes model.aliases: claude/claude-fast/claude-deep/qwen/qwen-coder),
Model Routing Engine (task-appropriate model selection — ALREADY PARTIALLY
IMPLEMENTED via usam-orchestrator's model cheat-sheet), Evaluation Engine,
Experimentation Engine (A/B test learning outcomes, not just engagement),
Content QA Engine, Asset Management Engine (license/attribution/source per
asset — mandatory given heavy open-source/dataset usage), Open-Source
License Registry (MANDATORY structured doc: repo/purpose/license/commercial-
use/modify/embed/status per adopted external component — "open" != freely
commercially reusable), Media/Story Dataset Layer (Gutenberg/Wikisource/
LibriVox/Common Voice/Wikimedia Commons/Openverse — license-specific),
Vocabulary/Grammar/Speech/Video data sourcing (see full doc for candidate
list), Subtitle/Alignment Engine (Whisper/WhisperX/MFA/aeneas/Gentle),
Interactive Video Engine (H5P as a candidate rather than building every
activity type from scratch), Activity Engine + Activity Template Engine,
Flashcard Engine, Roleplay/Scenario/Interview/Presentation/Debate Engines,
Story Branching Engine, World State Engine, Achievement/Reward Engine
(evidence-based, not click-count-based), Portfolio/Evidence Engine, Progress
Visualization Engine, Learning Path Engine, Goal Engine, Daily Learning
Engine, Session Engine, Attention/Engagement Engine (behavioral signals,
conservative interpretation, not claimed psychological certainty),
Accessibility Engine, Responsive Experience Engine, age-adaptive Design
System, Animation Engine, UI Component System, Realtime Engine (WebSockets/
SSE/WebRTC/LiveKit/Yjs), Auth architecture (child/parent/teacher/admin roles
+ RBAC/ABAC), Privacy Engine, Audit Engine, Observability Engine
(OpenTelemetry/Prometheus/Grafana/Sentry — NOTE: overlaps directly with
Dept 3 DevOps/SRE agents already in usam-agent-roster), Analytics Engine
(product analytics vs learning analytics kept SEPARATE — retention != learning),
Feature Flag Engine (maps to existing feature-flags-architect skill/agent),
CMS/Content Studio + Curriculum/Character/Mission/Activity Authoring Engines,
Localization CMS, Translation QA Engine, AI Prompt/Policy Engine (versioned
prompts with safety policy + eval, not scattered in code), Data Pipeline
Engine, Dataset Versioning, Content Provenance Engine, Deduplication Engine,
Semantic Search, Knowledge Extraction Engine, Automatic Curriculum Mapping,
Bloom Engine, Competency Engine, Evidence-Based Mastery, Transfer Engine,
Misconception Engine, Error Taxonomy Engine, Intervention Engine, Learning
Recovery Engine, Cross-Domain/Interdisciplinary Project Engine, Real-World
Challenge Engine, Sandbox Marketplace/Plugin Architecture (new engines
should plug in via manifest/capabilities/permissions, not require rewrites).

================================================================================
OPEN-SOURCE CANDIDATES BY TIER (user's own framework — RESPECT THIS, do not
mass-install)
================================================================================
Tier A — Core (becomes real part of architecture)
Tier B — Embedded (take the library/engine, modify it)
Tier C — Reference (study architecture, build USAM-equivalent)
Tier D — Dataset (ingest + normalize + license-check)
Tier E — Optional (enable if/when needed)
Tier F — Future (VR/AR/3D etc.)

Core candidates the user flagged as worth reviewing first (verify license +
security + fit before adopting ANY of these — do not install blind):
- Learning/adaptive: OpenTutor, LearningMAP, Knowledge Spaces, LearnGraph,
  Tutor MCP, OATutor
- English: LanguageTool (LGPL, strong candidate), WordNet, Wiktionary,
  ConceptNet, Common Voice, LibriSpeech, DailyDialog, MultiWOZ, Universal
  Dependencies, CMUdict
- Coding: Scratch VM/GUI/Blocks, Blockly, Monaco, CodeMirror, Pyodide,
  JupyterLite, Sandpack, WebContainers
- Interactive learning: H5P
- AI infra: LangGraph, LiteLLM, vLLM, Ollama, Qdrant, pgvector, Neo4j,
  OpenSearch (NOTE: this server's AWS setup already covers much of this via
  Bedrock/OpenSearch/DynamoDB — cross-check before adding new infra)
- Voice: Whisper/faster-whisper/whisper.cpp/sherpa-onnx, Piper, Coqui TTS,
  Kokoro, WebRTC, LiveKit
- Creative: Phaser, Godot, Three.js, R3F, Babylon.js, Rive, Lottie, Blender,
  Fabric.js, Konva, tldraw, Excalidraw
- Collaboration: Yjs, Liveblocks, WebRTC
- Safety: OpenAI Guardrails, Presidio, NeMo Guardrails, OpenGuardrails;
  ai-child repo as an ARCHITECTURE REFERENCE ONLY (not a certification, not
  a drop-in safety solution)

Reference repos mentioned by name (study architecture, verify license before
any code reuse):
github.com/zijinz456/OpenTutor, github.com/fenago/LearnGraph,
github.com/vanderbilt-data-science/knowledge-spaces,
github.com/ronaldowzy/ai-child, github.com/languagetool-org/languagetool,
github.com/liveblocks/liveblocks, github.com/openai/openai-guardrails-python,
github.com/Rehab-Hamdy/Agentic-AI-Tutor, github.com/h5p/moodle-mod_hvp,
github.com/ArnaudGuiovanna/tutor-mcp, oatutor.io,
ai-for-edu/LearningMAP (fastly-mirrored URL in source, verify canonical repo).

================================================================================
ARCHITECTURE DECISION (user's explicit instruction — follow this literally)
================================================================================
Do NOT build "hundreds of engines" as microservices from day one. Define
Engine Contracts (clear interfaces/responsibilities) from the start, but
implement modularly inside a coherent architecture. Only split into a
separate service after a REAL bottleneck appears. 150 microservices in an
early-stage product is complexity with no payoff.

================================================================================
YOUR JOB WITH THIS DOCUMENT (do not skip)
================================================================================
Treat this file as the requirements universe for USAM Learning Worlds (Kids).
For EVERY engine/feature listed above, produce and maintain a living
Implementation Gap Matrix against the actual current codebase
(~/projects/USAM-Learning-Worlds and what's actually deployed on
Kids-server), classifying each as one of:
  Already implemented | Partially implemented | Missing | Conflict |
  Needs refactor | Open-source candidate | Build custom | Future

Cross-reference against docs/architecture/USAM_GAP_REGISTER.md,
docs/architecture/USAM_IMPLEMENTATION_ROADMAP.md,
docs/backend/FINAL_BACKEND_ROADMAP.md, and ROADMAP_VISUAL.md — those files
already track some of this; reconcile rather than duplicate. Save the gap
matrix as docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md in the repo,
commit it, and keep it current as engines get built or plans change.

Priority order once security fixes (see cron job's other instructions) are
stable: build/verify the 15 must-not-forget engines list above first, in
roughly the order listed, before fanning out to the rest of the 171. Every
adopted external library/dataset MUST get an entry in the Open-Source
License Registry section of that gap matrix (source, license, commercial-use
Y/N, redistribution Y/N, status) before its code is merged — no exceptions,
this was explicit in the source document ("open" != freely reusable).
