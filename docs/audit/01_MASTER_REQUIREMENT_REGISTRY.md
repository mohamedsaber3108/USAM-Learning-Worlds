# 01 — Master Requirement Registry

**Purpose:** the single normalized, deduplicated list of every requirement extracted from all 7 `Kids/` spec files. Every other audit file references these stable IDs. Nothing from the spec files is dropped; overlapping requirements are merged and the strongest wording preserved.

## Status vocabulary (exact)

`CONFIRMED_COMPLETE` · `PARTIALLY_IMPLEMENTED` · `IMPLEMENTED_BUT_INCORRECT` · `IMPLEMENTED_BUT_INCOMPLETE` · `IMPLEMENTED_BUT_NEEDS_ENHANCEMENT` · `PRESENT_BUT_NOT_CONNECTED` · `FRONTEND_ONLY` · `BACKEND_ONLY` · `DATABASE_ONLY` · `CONTRACT_ONLY` · `MOCK_ONLY` · `PLACEHOLDER` · `BROKEN` · `DUPLICATED` · `LEGACY` · `DEPRECATED` · `MISSING` · `REQUIRES_RESEARCH` · `REQUIRES_DESIGN` · `REQUIRES_DECISION` · `REQUIRES_REFACTOR` · `REQUIRES_REPLACEMENT` · `REQUIRES_SECURITY_REVIEW` · `REQUIRES_EDUCATIONAL_VALIDATION` · `REQUIRES_LEGAL_REVIEW`

**Provisional status** below reflects the inventory snapshot evidence gathered so far. Items marked `⧗` still need per-file/line confirmation in the domain audits (files 02–14) before being frozen. This registry is a living document until `FINISH`.

## ID prefixes

`IDN` Identity/Access · `PROF` Learner Profile/State · `AGE` Age & Developmental Adaptation · `KG` Knowledge Graph · `CUR` Curriculum/Standards · `ADAPT` Adaptive Learning · `MAS` Mastery · `ASSESS` Assessment · `REV` Spaced Review · `REC` Recommendation · `EVID` Learning Evidence · `MIS` Missions/Quests · `WORLD` World · `ACT` Activities/Practice · `PROJ` Projects/PBL · `CHAL` Challenges · `GAM` Gamification · `ENG` English · `CODE` Coding · `AIL` AI Literacy · `SCI` Science · `CRT` Creativity · `THINK` Critical/Computational Thinking · `COMM` Communication · `ENT` Entrepreneurship · `DIG` Digital Skills · `FIN` Financial Literacy · `STORY` Story · `PORT` Portfolio/Credentials · `CHAR` Characters · `AVATAR` Avatar/Animation · `VOICE` Voice/Speech · `AI` AI Orchestration/Router/Cost · `RAG` Retrieval · `AIEVAL` AI Evaluation · `SAFE` Child Safety · `PRIV` Privacy/Legal · `SEC` Security · `PARENT` Parent · `COMMU` Community · `A11Y` Accessibility/SEN · `LOC` Localization · `CMS` Content/CMS/Provenance · `SEARCH` Search · `NOTIF` Notifications · `BILL` Billing/Entitlement · `ANALYT` Analytics/Experiments/Observability · `FE` Frontend Platform · `BE` Backend Platform · `DB` Data Model · `API` Contracts · `TEST` Testing · `INFRA` Infra/DevOps/Offline/DR · `SCHOOL` School/B2B · `OSS` Open-source discipline · `OPS` Human Ops/Review · `TRUTH` Product-truth/learning-effectiveness

---

## 1. Identity & Access (IDN)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-IDN-001 | Child account with profile (age, band, level, interests, goals, prefs, accessibility prefs, avatar, relationships, progress, mastery, portfolio, achievements) | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-IDN-002 | Parent/guardian account, registration, parent–child linking, verification | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-IDN-003 | Authentication: sign up, login, logout, session management | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-IDN-004 | Password recovery, email verification, passwordless/magic-link options | ⧗ |
| USAM-IDN-005 | Device/session management, suspicious-login detection | ⧗ |
| USAM-IDN-006 | Authorization / role management (child, parent, admin, author, moderator, support, AI agents, internal services) | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-IDN-007 | Child account must never expose parent/payment/admin capabilities | REQUIRES_SECURITY_REVIEW ⧗ |
| USAM-IDN-008 | Child must never escalate to parent/admin; impersonation protection | REQUIRES_SECURITY_REVIEW ⧗ |
| USAM-IDN-009 | Full account lifecycle: parent signup → child creation → age band → consent → controls → subscription → data access/correction/deletion → account deletion | ⧗ |
| USAM-IDN-010 | Account edge cases: multiple children, separated parents, ownership transfer, aging into band, subscription expiry, email change, consent withdrawal | ⧗ |
| USAM-IDN-011 | Parental consent capture and enforcement (age-appropriate, jurisdiction-aware) | REQUIRES_LEGAL_REVIEW ⧗ |

## 2. Learner Profile & State (PROF)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-PROF-001 | Learner Profile engine drives personalization (not just storage): age, band, level, skills, competencies, concepts, mastery, confidence, misconceptions, history, attempts, interests, goals, modalities, pace, accessibility, project history, relationships, engagement, review state | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-PROF-002 | Learner State layer: what the learner knows / where confused / what should happen next (distinct from event log) | ⧗ |
| USAM-PROF-003 | Long-term memory separation: educational memory / character memory / safety memory | ⧗ |
| USAM-PROF-004 | Explicit "never stored" policy for children (data minimization) | REQUIRES_LEGAL_REVIEW ⧗ |
| USAM-PROF-005 | Engagement signals captured and used by adaptive/rec engines | ⧗ |

## 3. Age & Developmental Adaptation (AGE)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-AGE-001 | Three bands (8–9 / 10–11 / 12–14) drive UI, language, text density, voice dependence, interaction complexity, reading load, visuals, characters, missions, activities, coding, projects, AI behavior, autonomy, difficulty, feedback, assessment, rewards, navigation, content | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-AGE-002 | Age-band research grounded in cognitive development, attention span, executive function, autonomy, motivation (not arbitrary buckets) | REQUIRES_RESEARCH |
| USAM-AGE-003 | Dynamic adaptation beyond static age (adapts with the learner) | ⧗ |
| USAM-AGE-004 | ICO Children's-Code style risk-based age-appropriate application | REQUIRES_LEGAL_REVIEW |

## 4. Knowledge Graph (KG)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-KG-001 | Concept→prerequisite→concept, skill→competency→concept, misconception→concept, objective→required competency | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-KG-002 | Track knowledge states, prerequisites, dependencies, weak concepts, missing prerequisites, misconceptions, mastery relationships | ⧗ |
| USAM-KG-003 | Evaluate OpenTutor / LearnGraph / Knowledge Space Theory as references | REQUIRES_RESEARCH |

## 5. Curriculum & Standards (CUR)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-CUR-001 | Curriculum design grounded in learning science + standards (CEFR for English; UNESCO AI competency; computational-thinking progressions) | REQUIRES_EDUCATIONAL_VALIDATION |
| USAM-CUR-002 | Curriculum versioning (v1/v2, per age band, per domain) without destroying learner progress | ⧗ |
| USAM-CUR-003 | Learning objectives, skills, competencies, concepts modeled and connected | PARTIALLY_IMPLEMENTED ⧗ |

## 6. Adaptive Learning (ADAPT)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-ADAPT-001 | Dynamically choose what to learn/practice/difficulty/explanation/modality/character/mission/project, when to review/remediate/accelerate | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-ADAPT-002 | Inputs: performance, mastery, misconceptions, age, level, objective, context, history, modality, pace → output "Next Best Learning Action" | ⧗ |
| USAM-ADAPT-003 | Decide the model scientifically (BKT/DKT/IRT/KST/FSRS/mastery thresholds/hybrid) — not "LLM decides everything" | REQUIRES_RESEARCH |
| USAM-ADAPT-004 | Remediation on failed prerequisite; acceleration on fast mastery; modality switch; review on forgetting | ⧗ |

## 7. Mastery (MAS)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-MAS-001 | Completion ≠ mastery: track level, confidence, evidence, attempts, misconceptions, recency, retention, progression | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-MAS-002 | Mastery estimate from performance + consistency + difficulty + time + hints + transfer + project evidence + confidence | ⧗ |

## 8. Assessment (ASSESS)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-ASSESS-001 | Types: MCQ, T/F, matching, ordering, fill-in, short answer, open response, oral, pronunciation, reading, listening, coding, project rubric, scenario, practical demonstration | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-ASSESS-002 | Difficulty, attempts, hints, partial credit, rubrics, feedback, misconception detection, mastery update, retry, alternative question, adaptive difficulty | ⧗ |
| USAM-ASSESS-003 | Assessment science: diagnostic/formative/summative/adaptive/mastery/rubric/project/oral, confidence calibration | REQUIRES_EDUCATIONAL_VALIDATION |
| USAM-ASSESS-004 | AI must not declare mastery from a couple of correct answers | ⧗ |

## 9. Spaced Review (REV)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-REV-001 | FSRS-style scheduling; review queues; vocab/grammar/concept/fact/coding/AI/science/misconception review | PARTIALLY_IMPLEMENTED ⧗ (naive fixed-bucket scheduler exists; not true FSRS) |
| USAM-REV-002 | Adopt real FSRS or equivalent, evidence-based | REQUIRES_RESEARCH |

## 10. Recommendation (REC)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-REC-001 | Recommend next lesson/activity/practice/mission/project/review/challenge/character/world/modality, consuming profile+mastery+KG+adaptive | PARTIALLY_IMPLEMENTED ⧗ |

## 11. Learning Evidence (EVID)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-EVID-001 | First-class Evidence engine: every activity/quiz/conversation/project/code/presentation/experiment/reflection → Evidence → Skill → Competency → Mastery → Portfolio → Credential | PARTIALLY_IMPLEMENTED ⧗ (Evidence model exists; full chain unproven) |

## 12. Missions / World / Activities / Practice (MIS/WORLD/ACT)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-MIS-001 | Mission = narrative + objective + prerequisites + activities + practice + checkpoints + hints + AI interaction + project + assessment + mastery requirement + reward + unlock | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-WORLD-001 | Worlds (English/Coding/AI/Science/Creativity/etc.) with theme, characters, missions, skills, unlock reqs, progress, story, projects, challenges, rewards; real World model + relations | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-ACT-001 | Adaptive practice across English/coding/AI/science/logic/critical-thinking/math/digital/financial; difficulty responds to mastery | ⧗ |

## 13. Projects / PBL (PROJ)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-PROJ-001 | Project brief, learner choice, milestones, research, creation, iteration, mentor guidance, rubric, reflection, presentation, evidence, portfolio publishing | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-PROJ-002 | PBL scaffolding pipeline: Idea→Plan→Research→Build→Test→Improve→Present→Reflect→Portfolio | ⧗ |

## 14. Challenges & Gamification (CHAL/GAM)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-CHAL-001 | Puzzles, logic, timed, personal bests, mastery challenges, optional non-toxic competition | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-GAM-001 | XP, levels, streaks, achievements, badges, unlocks, quests, collectibles, personal milestones — no manipulative mechanics | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-GAM-002 | Anti-manipulation review: streak pressure, comparison anxiety, reward dependency, nudge techniques (Children's-Code aware) | REQUIRES_RESEARCH |

## 15. English Learning (ENG)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-ENG-001 | Vocabulary (families, syn/ant, context, collocations, idioms, spaced repetition, active/passive) | ⧗ |
| USAM-ENG-002 | Grammar (concepts, sentence construction, error correction, progression, contextual practice) | PARTIALLY_IMPLEMENTED ⧗ (LanguageTool-style grammar exists) |
| USAM-ENG-003 | Reading (phonics where appropriate, recognition, comprehension, stories/articles, inference, main idea, vocab-in-context) | ⧗ |
| USAM-ENG-004 | Listening (comprehension, discrimination, speeds, voices, contextual, Q&A) | MISSING ⧗ |
| USAM-ENG-005 | Speaking (conversation, roleplay, interviews, situational, fluency, pronunciation, response quality, confidence) | PARTIALLY_IMPLEMENTED ⧗ (pronunciation is a hardcoded placeholder score) |
| USAM-ENG-006 | Writing (spelling, sentences, paragraphs, stories, messages, project writing, feedback, grammar/vocab improvement) | ⧗ |
| USAM-ENG-007 | CEFR-aligned progression, diagnostics, remediation, spaced review, pronunciation feedback, listening discrimination, project-based & real-world English | REQUIRES_EDUCATIONAL_VALIDATION ⧗ |
| USAM-ENG-008 | English=target, Egyptian Arabic=scaffold; progressively reduce scaffolding (don't translate everything forever) | ⧗ |
| USAM-ENG-009 | Content provenance for every English resource (source, license, attribution, version, commercial compatibility, transformation rights); never assume a dataset is reusable | REQUIRES_LEGAL_REVIEW |
| USAM-ENG-010 | English dataset discovery (pronunciation/speech/vocab/reading/listening/dialogues/stories/grammar/CEFR/word-frequency/phonics/collocations) with per-dataset license audit | REQUIRES_RESEARCH |

## 16. Coding (CODE)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-CODE-001 | Beginner: computational thinking, sequencing, logic, patterns, events, conditions, loops, variables | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CODE-002 | Visual coding (Scratch/Blockly): block challenges, games, animations, story projects | MISSING ⧗ (no Blockly/Scratch integration found) |
| USAM-CODE-003 | Intermediate: JavaScript/Python, algorithms, debugging, functions, data, age-appropriate APIs | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CODE-004 | Coding environment: editor, syntax highlight, execution, sandbox, console, errors, tests, hints, save, versioning, project history | PARTIALLY_IMPLEMENTED ⧗ (Pyodide/Sandpack present) |
| USAM-CODE-005 | Code execution must be isolated/secure (resource/CPU/memory/network/FS limits, timeout) — not just an iframe | REQUIRES_SECURITY_REVIEW |
| USAM-CODE-006 | OSS eval: Blockly (Apache-2.0, maintained), current Scratch ecosystem (not archived scratch-vm), Pyodide, JupyterLite, Monaco, Phaser, GDevelop | REQUIRES_RESEARCH |

## 17. AI Literacy & other learning engines (AIL/SCI/CRT/THINK/COMM/ENT/DIG/FIN)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-AIL-001 | Teach about AI: what AI/ML/GenAI/LLMs are, prompting, limitations, hallucinations, bias, privacy, safety, ethics, human-in-the-loop, evaluation, AI projects; progression Understand→Use→Evaluate→Create→Question→Use Responsibly (UNESCO-aligned) | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-SCI-001 | Science inquiry cycle: observe→predict→hypothesize→experiment→measure→analyze→explain→reflect; experiments, simulations, data, projects | PARTIALLY_IMPLEMENTED ⧗ (simulation module exists) |
| USAM-CRT-001 | Creativity/design: ideation, divergent/convergent, design, storytelling, UX, prototyping, iteration, creative challenges/projects | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-THINK-001 | Critical/computational thinking: logic, evidence, assumptions, reasoning, patterns, argument evaluation, decisions, decomposition, lateral thinking, problem solving | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-COMM-001 | Communication: speaking, listening, presentation, storytelling, explanation, collaboration, feedback, confidence, public speaking | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-ENT-001 | Entrepreneurship: problem discovery, user research, value prop, ideation, experimentation, budgeting, pitching, sustainability, social impact | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-DIG-001 | Digital skills: literacy, online safety, privacy, passwords, phishing, misinformation, media literacy, research, productivity, files, collaboration, citizenship | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-FIN-001 | Financial literacy (age-adapted): money, needs/wants, saving, budgeting, spending, earning, planning, responsible digital-payment concepts; children never touch real purchasing | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-SCI-002 | Science simulation/virtual-lab framework: physics/chemistry sims, data collection, graphing, hypothesis testing, experiment logging | REQUIRES_RESEARCH ⧗ |

## 18. Story / Portfolio / Credentials (STORY/PORT)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-STORY-001 | Branching stories with choices/consequences, characters, educational objectives, contextual narrative across domains | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-PORT-001 | Portfolio: coding/design/presentation/English/AI/science/entrepreneurship projects, reflections, certificates/badges, mastery evidence | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-PORT-002 | Credentials: evidence→verified competency→badge→credential→portfolio; Open Badges compatibility | REQUIRES_RESEARCH ⧗ |

## 19. Characters (CHAR)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-CHAR-001 | ONE configurable Character Framework (not 15 hardcoded chatbots): identity, role, personality, age suitability, domains, capabilities, dialogue style, animation states, voice, safety policy, permissions, memory scope, relationship progression, unlock conditions | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CHAR-002 | Full 15-character universe (Azouz, Zein, Luma, Codey, NOVA, Mira, Rami, Faris, Tala, Adam, Byte, Nour, Rex, Zara, Atlas) with canonical roles | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CHAR-003 | Character Orchestrator: decides when Luma/Codey/etc. take over vs. Azouz, based on mission/objective context | MISSING ⧗ |
| USAM-CHAR-004 | Character relationship must NEVER encourage secrecy, exclusivity, dependency, guilt, avoiding parents, hiding conversations | REQUIRES_SECURITY_REVIEW |
| USAM-CHAR-005 | Character memory scope (relationship, prior conversations, relevant prefs) with strict privacy bounds | ⧗ |

## 20. Avatar / Animation (AVATAR)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-AVATAR-001 | Learner avatar (body/head/clothing/accessories/identity/style/unlockables) | ⧗ |
| USAM-AVATAR-002 | Character animation states (idle/listening/thinking/speaking/happy/excited/confused/encouraging/celebration/error/sleeping) | PARTIALLY_IMPLEMENTED ⧗ (SVG CharacterFace exists) |
| USAM-AVATAR-003 | OSS eval: Rive/Lottie/Three.js/PixiJS/Phaser with license+maintenance review | REQUIRES_RESEARCH |

## 21. Voice / Speech (VOICE)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-VOICE-001 | Provider-independent abstraction: STT, TTS, realtime, streaming, turn-taking, interruption, VAD, error handling; states idle→listening→thinking→speaking→paused→muted→error | PARTIALLY_IMPLEMENTED ⧗ (voice module + sidecars exist) |
| USAM-VOICE-002 | Full pipeline: child speaks→VAD→STT→safety→intent→learner context→character→LLM→safety→TTS→streaming→interruption | ⧗ |
| USAM-VOICE-003 | Egyptian-Arabic STT/TTS + child-speech benchmark (8/10/14yo, AR/EN code-switching, noise, mics) | REQUIRES_RESEARCH |
| USAM-VOICE-004 | OSS eval: Whisper, LiveKit Agents, Pipecat, Moshi, sherpa-onnx/SenseVoice, maintained Piper successor | REQUIRES_RESEARCH |

## 22. AI Orchestration / Router / Cost / RAG / Evaluation (AI/RAG/AIEVAL)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-AI-001 | AI Model Router: classify task complexity → route to cheap/reasoning/coding/voice/vision/moderation/fallback model | MISSING ⧗ |
| USAM-AI-002 | AI Cost engine: token/latency/cost-per-child/session/voice-minutes/embeddings/cache/fallback tracking; unit economics | PARTIALLY_IMPLEMENTED ⧗ (AIUsageLog exists) |
| USAM-AI-003 | Provider abstraction with adapters + local fallback for LLM/STT/TTS/embeddings/vector/realtime | PARTIALLY_IMPLEMENTED ⧗ (Bedrock + provider service) |
| USAM-RAG-001 | Retrieval: ingestion, chunking, embeddings, metadata, semantic search, filtering (age/domain/language), source attribution, retrieval permissions; never expose vector creds to frontend | PARTIALLY_IMPLEMENTED ⧗ (keyword/full-text grounding only; no vector store) |
| USAM-RAG-002 | OSS eval: Qdrant vs pgvector vs Weaviate/Milvus/OpenSearch/Meilisearch/Typesense — decide if a vector DB is even needed yet | REQUIRES_RESEARCH |
| USAM-AIEVAL-001 | AI Evaluation engine (separate from safety): factuality, age-appropriateness, educational quality, difficulty, hallucination, bias, EN/Arabic quality, curriculum alignment; Generate→Validate→Evaluate→Human-review→Publish | PARTIALLY_IMPLEMENTED ⧗ (AIEval golden-dataset harness exists) |
| USAM-AIEVAL-002 | AI transparency for children: age-appropriate "you're talking to AI", uncertainty, source attribution, human-in-loop disclosure | ⧗ |
| USAM-AIEVAL-003 | AI reproducibility/auditability: record model/version/prompt-version/retrieval-version/policy-version/timestamp/classifications | ⧗ |

## 23. Safety / Privacy / Security (SAFE/PRIV/SEC)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-SAFE-001 | Architectural safety layer (not just prompts): states SAFE/RESTRICTED/BLOCKED/ESCALATION_REQUIRED/PARENT_APPROVAL_REQUIRED | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-SAFE-002 | Protect against sexual/violent/self-harm/unsafe-advice content, manipulation, secrecy, dependency, privacy leakage, prompt injection, jailbreaks, unsafe tools | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-SAFE-003 | Moderation, reporting, escalation, safety logs, human review | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-SAFE-004 | Child-AI relationship/dependency controls (its own research track) | REQUIRES_RESEARCH |
| USAM-SAFE-005 | Red-team program (jailbreaks/injection/grooming/sexual/violence/self-harm/dangerous experiments/privacy extraction/impersonation/takeover/cheating/sandbox escape/uploads/links/RAG poisoning/character manipulation/reward exploitation) | PARTIALLY_IMPLEMENTED ⧗ (red-team suite exists) |
| USAM-SAFE-006 | OSS eval: NeMo Guardrails, LlamaFirewall, ai-child reference | REQUIRES_RESEARCH |
| USAM-PRIV-001 | Legal matrix: COPPA, GDPR/GDPR-K, UK Children's Code, EU AI Act, Egypt/Saudi DP law; consent, retention, deletion, access, profiling, voice/biometric, transfers → APPLIES/MAY/DOES-NOT/NEEDS-LAWYER | REQUIRES_LEGAL_REVIEW |
| USAM-PRIV-002 | Data lifecycle per data type: collect→process→store→use→share?→retain→archive?→delete (esp. voice, conversations, projects, analytics, profiles, safety events, uploads, generated content) | REQUIRES_LEGAL_REVIEW ⧗ |
| USAM-SEC-001 | Security: authn, authz, validation, secure sessions/cookies/tokens, rate limiting, XSS/CSRF, secret management, sandbox isolation, upload security, SSRF, prompt-injection defense, tool permissions, dependency/supply-chain, audit logs | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-SEC-002 | Threat model + supply-chain security (SBOM, lockfiles, container/secret scanning, signed artifacts, provenance) | REQUIRES_SECURITY_REVIEW |
| USAM-SEC-003 | Tool/capability permission system for AI agents (allow/deny per character: internet/email/purchases/tools) | MISSING ⧗ |

## 24. Parent / Community (PARENT/COMMU)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-PARENT-001 | Parent dashboard: progress, competencies, learning time, missions, projects, safety, privacy, approvals, comms prefs, account controls — useful without invasive surveillance | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-PARENT-002 | Parent↔child meaningful-summary communication layer ("ask your child about…"), not surveillance | ⧗ |
| USAM-COMMU-001 | Community (if enabled): child-safe profiles, moderation, reporting, blocking, age-appropriate interaction, parent controls, escalation; no uncontrolled child-to-stranger contact | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-COMMU-002 | Explicit V1 decision: community on/off; if on, grooming-prevention + human+AI moderation + age segregation | REQUIRES_DECISION |

## 25. Accessibility / SEN (A11Y)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-A11Y-001 | WCAG, keyboard nav, screen readers, color contrast, dyslexia-friendly, font scaling, reduced motion, captions, audio alternatives, motor/visual accessibility | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-A11Y-002 | SEN adaptation (ADHD/dyslexia/reading/speech/visual/hearing/motor/neurodiverse) without diagnosing children | REQUIRES_RESEARCH |
| USAM-A11Y-003 | Automated a11y testing (axe-core/pa11y) in CI | MISSING ⧗ |

## 26. Localization (LOC)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-LOC-001 | Arabic + English; RTL/LTR; Egyptian-friendly explanations/voice; localized character dialogue + content metadata | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-LOC-002 | i18n architecture beyond translation: locale, language, direction, number/date formats, voice, curriculum, cultural context, content availability (Egypt not hardcoded) | ⧗ |
| USAM-LOC-003 | Arabic must not be a translated English UI; genuinely Arabic-first where appropriate | REQUIRES_EDUCATIONAL_VALIDATION ⧗ |

## 27. Content / CMS / Provenance (CMS)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-CMS-001 | Content hierarchy + metadata (age range, difficulty, language, skill, competency, concept, objective, prereqs, duration, type, character, world, mission, version, status, author, source, license, attribution, publishing state) | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CMS-002 | CMS workflow: draft→review→publish→unpublish→versioning→rollback→approval | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CMS-003 | Content provenance record for every item (source/author/license/version/dates/AI-generated?/human-reviewed?/reviewer/age/curriculum mapping) | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-CMS-004 | Content generation pipeline: curriculum→objective→AI generate→pedagogical/age/fact/safety/difficulty validation→human review→publish (not "GPT generates→publish") | ⧗ |
| USAM-CMS-005 | Content supply chain (continuous authoring→generation→validation→safety→pedagogical eval→human review→version→publish→monitor→improve) | ⧗ |
| USAM-CMS-006 | Teacher/non-engineer authoring (H5P/editor eval) | REQUIRES_RESEARCH |

## 28. Search / Notifications / Billing (SEARCH/NOTIF/BILL)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-SEARCH-001 | Semantic search across worlds/topics/skills/missions/projects/characters/resources | PARTIALLY_IMPLEMENTED ⧗ (full-text search module exists) |
| USAM-NOTIF-001 | In-app/parent/email notifications, review reminders, milestones, project reminders, safety notifications — no spam/manipulation | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-BILL-001 | Parent-only billing: plans, subscription, coupons, payment abstraction, invoice, cancellation, entitlements, access control; children never control purchasing | MISSING ⧗ |
| USAM-BILL-002 | Commerce edge cases: family/sibling plans, regional pricing, failed payments, tax/VAT, refunds, provider abstraction | ⧗ |

## 29. Analytics / Experiments / Observability (ANALYT)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-ANALYT-001 | Educational events (activity started/completed, objective completed, assessment attempt, mastery change, review due, project progress, hint, character interaction, recommendation, safety event) | PARTIALLY_IMPLEMENTED ⧗ (LearningEvent model + analytics module) |
| USAM-ANALYT-002 | Three distinct analytics layers: Product / Learning / AI | ⧗ |
| USAM-ANALYT-003 | Product observability: logs, metrics, traces, error tracking, feature flags | PARTIALLY_IMPLEMENTED ⧗ (pino logging, feature flags, experiments modules) |
| USAM-ANALYT-004 | Experimentation engine with age/safety safeguards; gradual rollout + rollback | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-ANALYT-005 | Anti-gaming/anti-cheating: XP farming, easy-question spam, AI-answer copying, fake projects, rushing, mastery manipulation, answer sharing | ⧗ |
| USAM-ANALYT-006 | OSS eval: PostHog/Sentry/Unleash/OpenTelemetry/Prometheus/Grafana/Loki/Jaeger | REQUIRES_RESEARCH |

## 30. Platform / Data / Contracts / Testing (FE/BE/DB/API/TEST)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-FE-001 | Production-grade, responsive, accessible, typed, modular, API-ready; UI→State→Service/Repository→API; design system, typed models, API client, repositories, services, state mgmt, caching, error boundaries, loading/empty/error states | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-FE-002 | Single authoritative frontend; deprecate/remove root TanStack mock app; enforce in CI/deploy | IMPLEMENTED_BUT_NEEDS_ENHANCEMENT ⧗ |
| USAM-FE-003 | Device-specific UX (phone/tablet/desktop/landscape/touch/keyboard/mic/camera/low-end Android/slow network) | ⧗ |
| USAM-BE-001 | Clean separation: API/domain/application services/engines/repositories/persistence/AI orchestration/safety/jobs/integrations/authz/observability; no giant controllers/services | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-DB-001 | Domain entities present and non-duplicated (User…AuditLog set); reuse over duplication | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-DB-002 | Migration integrity: schema.prisma vs applied migrations vs manual SQL; drift checked | REQUIRES_REFACTOR ⧗ |
| USAM-API-001 | Per-feature contract integrity: UI model↔API DTO↔domain↔DB↔validation↔authz↔persistence↔events↔analytics; detect stale endpoints, field/enum mismatches, duplicate models, mock-only flows | IMPLEMENTED_BUT_INCORRECT ⧗ (known duplicate-prefix + UUID-as-number + refresh-token issues on old baseline; re-verify on current) |
| USAM-TEST-001 | Full testing: unit, integration, API-contract, DB, engine, component, E2E, a11y, security, AI-eval, safety, regression, mobile, performance/load; deterministic tests for critical engines | PARTIALLY_IMPLEMENTED ⧗ (only 4 backend specs; 0 frontend tests) |

## 31. Infra / Offline / DR / School / OSS / Ops / Product-Truth (INFRA/SCHOOL/OSS/OPS/TRUTH)

| ID | Requirement | Provisional status |
|---|---|---|
| USAM-INFRA-001 | Failure-mode architecture: graceful degradation when LLM/STT/TTS/realtime/DB/Redis/vector/payment/email fail | ⧗ |
| USAM-INFRA-002 | Offline/low-bandwidth: PWA, service workers, IndexedDB, cached missions, local progress, sync queue, conflict resolution, compressed media, resumable downloads (critical for Egypt/MENA) | MISSING ⧗ |
| USAM-INFRA-003 | Backup/DR/business continuity: RPO/RTO, DB + object-storage backup, restore testing, regional failure, rollback | ⧗ |
| USAM-INFRA-004 | CDN/media architecture: image optimization, video transcoding, audio compression, CDN, adaptive streaming, caching, asset versioning, storage lifecycle | ⧗ |
| USAM-INFRA-005 | Capacity planning (1k→1M children) for voice sessions, WebSockets, DB, queues, AI requests, storage, bandwidth | ⧗ |
| USAM-INFRA-006 | Separate environments: dev/staging/AI-eval/safety-eval/prod | ⧗ |
| USAM-INFRA-007 | Versioning everything: curriculum, missions, assessments, rubrics, mastery/rec algorithms, prompts, characters, safety policies, models, content, translations | PARTIALLY_IMPLEMENTED ⧗ |
| USAM-INFRA-008 | Data export/portability (progress, portfolio, projects, credentials, history) respecting privacy | ⧗ |
| USAM-SCHOOL-001 | School/B2B readiness in architecture: org/admin/teacher/class/assignment/curriculum/analytics/licenses/SSO/roster; evaluate LTI + OneRoster | ⧗ |
| USAM-OPS-001 | Internal admin/operations console + human-in-the-loop workflows (safety escalation, content review, disputed moderation, curriculum review, AI eval, parent support, abuse reports, account recovery) | PARTIALLY_IMPLEMENTED ⧗ (16 admin pages exist) |
| USAM-OSS-001 | Mandatory OSS discovery/selection discipline for every subsystem: search→discover→compare(2–5)→verify→license→security→architecture→POC→decision (ADOPT/ADOPT+CUSTOMIZE/REFERENCE/POC/KEEP/REPLACE/REJECT/RESEARCH_MORE); never pick by stars; never adopt blindly | REQUIRES_RESEARCH |
| USAM-OSS-002 | Standards adoption over reinvention: xAPI 2.0, cmi5, Caliper, Open Badges, LTI, OneRoster, MCP, OpenTelemetry, WCAG/ARIA, OAuth2/OIDC/WebAuthn, OWASP ASVS/AISVS, NIST AI RMF | REQUIRES_RESEARCH |
| USAM-TRUTH-001 | "Does the product actually teach?" audit: for every major experience — what is learned, how taught, how practiced, how understanding checked, how misunderstanding detected, how remediated, how transfer tested, how mastery changes, what evidence produced, what's next | REQUIRES_EDUCATIONAL_VALIDATION |
| USAM-TRUTH-002 | Build vs Buy vs OSS vs Customize matrix for every subsystem, decided on educational fit/safety/security/license/ownership/performance/scalability/maintenance/cost/extensibility/strategic value | REQUIRES_DECISION |

---

## Registry notes

- **~150 normalized requirements** across 50+ domains. Counts and statuses are provisional until domain audits (files 02–14) attach file/line evidence; `⧗` marks unconfirmed items.
- Items marked `REQUIRES_RESEARCH` / `REQUIRES_LEGAL_REVIEW` / `REQUIRES_EDUCATIONAL_VALIDATION` are recorded honestly and will NOT be given fabricated "done" conclusions; they flow into `17_RESEARCH_BACKLOG.md`.
- Deduplication examples: Learning Evidence appears in `features.md`, `criticle 2.md` → single `USAM-EVID-001`. AI Model Router appears in `criticle points.md` + `criticle 2.md` → single `USAM-AI-001`. Provenance appears in `features.md` + `criticle 2.md` + `Must consider.md` → `USAM-CMS-003`/`USAM-ENG-009`.
