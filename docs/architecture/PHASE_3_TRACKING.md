# Phase 3: AI Intelligence & Character System - Implementation Tracking

**Started:** 2026-08-13  
**Status:** IN PROGRESS - Architecture Analysis

---

## Current State Analysis

### Existing AI Infrastructure ✓

**AI Module** (`backend/src/modules/ai/`)
- ✅ BedrockService — AWS Bedrock Claude 3.5 Sonnet integration
- ✅ ModerationService — Content moderation with quarantine
- ✅ AIUsageService — Token tracking
- ✅ AIController — 4 endpoints (feedback, hint, explain, analyze)

**Current Capabilities:**
1. `generateFeedback(work, rubric, context)` — Constructive feedback
2. `generateHint(question, attempt, difficulty)` — Progressive hints (easy/medium/hard)
3. `explainConcept(concept, age, context)` — Age-appropriate explanation
4. `analyzeResponse(question, response, keyPoints)` — Response scoring

**Database:**
- ✅ Character model (id, name, role, personality JSON, systemPrompt, avatarUrl)
- ✅ CharacterRole enum (GUIDE, MENTOR, COMPANION, CHALLENGER)
- ✅ AIUsageLog table
- ✅ ModerationLog table
- ✅ QuarantinedContent table

**Seed Data:**
- 1 character: "Azouz" (GUIDE role)

### Critical Gaps Identified

**❌ Provider Abstraction**
- BedrockService is hardcoded throughout
- No interface for swapping providers
- No model routing

**❌ Learner Context**
- AI receives minimal context (age only in explainConcept)
- No mastery context
- No mission/activity context
- No learning history

**❌ Character Intelligence**
- Character model exists but no behavior engine
- No character-learner interaction logic
- No context-aware responses
- No personality interpretation

**❌ Conversation System**
- No conversation sessions
- No message history
- No turn-taking
- No conversation memory

**❌ Age Adaptation**
- Only explainConcept uses age
- No systematic age-aware AI behavior
- No developmental stage awareness

**❌ Structured Outputs**
- AI returns raw strings
- No schema validation
- No typed responses

**❌ Voice**
- No voice infrastructure at all
- No STT/TTS interfaces
- No voice session management

---

## Phase 3 Implementation Plan

### Step 1: Provider Abstraction Layer ⏳

**Goal:** Decouple from Bedrock, enable multi-provider support

**Tasks:**
- [ ] Create `interfaces/ai-provider.interface.ts`
- [ ] Create `interfaces/llm-provider.interface.ts`
- [ ] Refactor BedrockService → BedrockAdapter implements LLMProvider
- [ ] Create AIProviderService (registry + routing)
- [ ] Update AIController to use provider service

**Files to Create:**
- `src/modules/ai/interfaces/` (new directory)
- `src/modules/ai/providers/` (new directory)
- `src/modules/ai/providers/bedrock.adapter.ts`
- `src/modules/ai/ai-provider.service.ts`

**Files to Modify:**
- `ai.module.ts` (add new providers)
- `bedrock.service.ts` (refactor to adapter)

### Step 2: Learner Context Engine ⏳

**Goal:** Assemble rich learning context for AI

**Tasks:**
- [ ] Create LearnerContextService
- [ ] Build context assembly from learner + mastery + mission
- [ ] Add data minimization rules
- [ ] Create LearnerContext interface

**New Models Needed:**
```prisma
model LearnerContext {
  id              String   @id @default(uuid())
  learnerId       String
  sessionId       String?
  ageBand         AgeBand
  currentDomainId String?
  currentMissionId String?
  currentActivityId String?
  masterySnapshot Json     // Recent mastery states
  preferencesSnapshot Json  // Safe subset
  generatedAt     DateTime @default(now())
  
  @@index([learnerId])
  @@index([sessionId])
}
```

### Step 3: AI Task Type System ⏳

**Goal:** Structured task definitions with schemas

**Tasks:**
- [ ] Define AITaskType enum (20+ types)
- [ ] Create schemas for each task
- [ ] Build task routing logic
- [ ] Add validation pipeline

**Task Types to Support:**
```typescript
enum AITaskType {
  EXPLAIN,
  HINT,
  ASSESS,
  FEEDBACK,
  ENCOURAGE,
  QUESTION,
  CONVERSE,
  ROLEPLAY,
  CODE_HELP,
  CODE_REVIEW,
  DEBUG,
  ENGLISH_CONVERSATION,
  ENGLISH_CORRECTION,
  PROJECT_GUIDANCE,
  PROJECT_REVIEW,
  BRAINSTORM,
  CREATIVE_COACHING,
  CRITICAL_THINKING,
  ENTREPRENEURSHIP_SIM,
  RECOMMEND,
  CHARACTER_RESPONSE
}
```

### Step 4: Character Intelligence System ⏳

**Goal:** Make characters contextually intelligent

**Tasks:**
- [ ] Create CharacterService
- [ ] Build character state management
- [ ] Implement personality engine
- [ ] Add age-appropriate character adaptation
- [ ] Integrate character with learner context

**New Models Needed:**
```prisma
model CharacterInteraction {
  id           String   @id @default(uuid())
  learnerId    String
  characterId  String
  interactionType String
  context      Json?
  request      String?  @db.Text
  response     String   @db.Text
  mood         String?
  createdAt    DateTime @default(now())
  
  @@index([learnerId])
  @@index([characterId])
  @@index([createdAt])
}

model CharacterState {
  id           String   @id @default(uuid())
  learnerId    String
  characterId  String
  relationshipLevel Int @default(1)
  interactionCount Int @default(0)
  lastInteraction DateTime?
  preferences  Json?
  updatedAt    DateTime @updatedAt
  
  @@unique([learnerId, characterId])
}
```

### Step 5: Conversation Engine ⏳

**Goal:** Persistent conversation sessions with memory

**Tasks:**
- [ ] Create Conversation + Message models
- [ ] Build conversation session management
- [ ] Implement memory (short-term vs learning)
- [ ] Add safety checks per message

**New Models:**
```prisma
model Conversation {
  id              String   @id @default(uuid())
  learnerId       String
  characterId     String
  sessionId       String?
  type            ConversationType
  status          ConversationStatus @default(ACTIVE)
  contextSnapshot Json?
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  
  messages ConversationMessage[]
  
  @@index([learnerId])
  @@index([characterId])
  @@index([sessionId])
}

model ConversationMessage {
  id              String   @id @default(uuid())
  conversationId  String
  role            MessageRole
  content         String   @db.Text
  metadata        Json?
  moderationResult Json?
  createdAt       DateTime @default(now())
  
  conversation Conversation @relation(fields: [conversationId], references: [id])
  
  @@index([conversationId])
}

enum ConversationType {
  LEARNING_SUPPORT
  ENGLISH_PRACTICE
  CODING_HELP
  PROJECT_GUIDANCE
  CASUAL
  ROLEPLAY
}

enum ConversationStatus {
  ACTIVE
  PAUSED
  ENDED
  BLOCKED
}

enum MessageRole {
  LEARNER
  CHARACTER
  SYSTEM
}
```

### Step 6: Voice Contracts (Interfaces Only) ⏳

**Goal:** Define voice system interfaces (implementation deferred)

**Tasks:**
- [ ] Create voice interfaces
- [ ] Define voice state machine
- [ ] Create voice session model

**Interfaces:**
```typescript
interface SpeechToTextProvider {
  transcribe(audio: Buffer, language: string): Promise<TranscriptionResult>
}

interface TextToSpeechProvider {
  synthesize(text: string, voice: string, language: string): Promise<AudioBuffer>
}

interface VoiceSession {
  id: string
  state: VoiceState
  language: string
  conversationId?: string
}

enum VoiceState {
  IDLE,
  LISTENING,
  THINKING,
  SPEAKING,
  INTERRUPTED,
  PAUSED,
  ERROR,
  MUTED
}
```

### Step 7: Domain-Specific AI Coaches ⏳

**Goal:** Specialized AI behavior per domain

**Tasks:**
- [ ] Create EnglishCoachService
- [ ] Create CodingCoachService
- [ ] Create CreativeCoachService
- [ ] Create CriticalThinkingCoachService
- [ ] Integrate with AIProviderService

### Step 8: Enhanced Safety & Validation ⏳

**Goal:** Robust safety for child AI interactions

**Tasks:**
- [ ] Add prompt injection detection
- [ ] Enhance PII detection
- [ ] Create output validation pipeline
- [ ] Add conversation-level safety
- [ ] Add anti-dependency checks

### Step 9: Cost Control & Observability ⏳

**Goal:** Monitor and optimize AI usage

**Tasks:**
- [ ] Add model routing by cost/complexity
- [ ] Implement token limits
- [ ] Add rate limiting per learner
- [ ] Enhanced telemetry
- [ ] Budget monitoring

### Step 10: Testing & Documentation ⏳

**Tasks:**
- [ ] Unit tests for provider abstraction
- [ ] Test age adaptation
- [ ] Test character behavior
- [ ] Test conversation flow
- [ ] Document AI architecture

---

## Progress Tracking

**Overall Progress:** 5% (Analysis phase)

| Component | Status | % Complete |
|-----------|--------|------------|
| Analysis | ✅ Done | 100% |
| Provider Abstraction | ⏳ Not Started | 0% |
| Learner Context | ⏳ Not Started | 0% |
| Task System | ⏳ Not Started | 0% |
| Character Intelligence | ⏳ Not Started | 0% |
| Conversation Engine | ⏳ Not Started | 0% |
| Voice Contracts | ⏳ Not Started | 0% |
| Domain Coaches | ⏳ Not Started | 0% |
| Safety Enhancement | ⏳ Not Started | 0% |
| Cost Control | ⏳ Not Started | 0% |
| Testing | ⏳ Not Started | 0% |

---

## Architecture Decisions

**Decision 1: Keep Bedrock, Add Abstraction**
- Bedrock works well, don't remove it
- Wrap it in adapter pattern
- Allow future providers

**Decision 2: Conversation ≠ Chat**
- Conversations are educational, not social
- Every conversation has learning context
- Safety is per-message AND per-conversation

**Decision 3: Memory Separation**
- Learning memory (what they learned) separate from conversation memory (what they said)
- Learning memory goes to mastery system
- Conversation memory is ephemeral with retention limits

**Decision 4: Voice is Interface-Only This Phase**
- Define contracts but defer implementation
- No STT/TTS integration yet
- Prepare architecture for future

**Decision 5: Character Intelligence Uses Existing AI**
- Characters don't need separate AI service
- Use provider abstraction with character context
- Personality is prompt engineering + context

---

## Next Immediate Actions

1. Create provider interfaces
2. Refactor BedrockService to adapter
3. Build LearnerContextService
4. Start character intelligence system
