-- Phase 3: AI Intelligence & Character System
-- Add tables for conversation, character interactions, and learner context

-- Conversation types
CREATE TYPE "ConversationType" AS ENUM (
  'LEARNING_SUPPORT',
  'ENGLISH_PRACTICE',
  'CODING_HELP',
  'PROJECT_GUIDANCE',
  'CASUAL',
  'ROLEPLAY'
);

CREATE TYPE "ConversationStatus" AS ENUM (
  'ACTIVE',
  'PAUSED',
  'ENDED',
  'BLOCKED'
);

CREATE TYPE "MessageRole" AS ENUM (
  'LEARNER',
  'CHARACTER',
  'SYSTEM'
);

-- Conversations table
CREATE TABLE "conversations" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" TEXT NOT NULL,
  "characterId" TEXT NOT NULL,
  "sessionId" TEXT,
  "type" "ConversationType" NOT NULL,
  "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
  "contextSnapshot" JSONB,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),

  CONSTRAINT "conversations_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE,
  CONSTRAINT "conversations_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE
);

CREATE INDEX "conversations_learnerId_idx" ON "conversations"("learnerId");
CREATE INDEX "conversations_characterId_idx" ON "conversations"("characterId");
CREATE INDEX "conversations_sessionId_idx" ON "conversations"("sessionId");
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- Conversation messages table
CREATE TABLE "conversation_messages" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" TEXT NOT NULL,
  "role" "MessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "moderationResult" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE
);

CREATE INDEX "conversation_messages_conversationId_idx" ON "conversation_messages"("conversationId");
CREATE INDEX "conversation_messages_createdAt_idx" ON "conversation_messages"("createdAt");

-- Character interactions table
CREATE TABLE "character_interactions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" TEXT NOT NULL,
  "characterId" TEXT NOT NULL,
  "interactionType" TEXT NOT NULL,
  "context" JSONB,
  "request" TEXT,
  "response" TEXT NOT NULL,
  "mood" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "character_interactions_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE,
  CONSTRAINT "character_interactions_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE
);

CREATE INDEX "character_interactions_learnerId_idx" ON "character_interactions"("learnerId");
CREATE INDEX "character_interactions_characterId_idx" ON "character_interactions"("characterId");
CREATE INDEX "character_interactions_createdAt_idx" ON "character_interactions"("createdAt");

-- Character state per learner
CREATE TABLE "character_states" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" TEXT NOT NULL,
  "characterId" TEXT NOT NULL,
  "relationshipLevel" INTEGER NOT NULL DEFAULT 1,
  "interactionCount" INTEGER NOT NULL DEFAULT 0,
  "lastInteraction" TIMESTAMP(3),
  "preferences" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "character_states_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE,
  CONSTRAINT "character_states_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE,
  CONSTRAINT "character_states_learnerId_characterId_key" UNIQUE ("learnerId", "characterId")
);

CREATE INDEX "character_states_learnerId_idx" ON "character_states"("learnerId");
CREATE INDEX "character_states_characterId_idx" ON "character_states"("characterId");

-- Learner context snapshots (for AI debugging/auditing)
CREATE TABLE "learner_contexts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "learnerId" TEXT NOT NULL,
  "sessionId" TEXT,
  "ageBand" "AgeBand" NOT NULL,
  "currentDomainId" TEXT,
  "currentMissionId" TEXT,
  "currentActivityId" TEXT,
  "masterySnapshot" JSONB NOT NULL,
  "preferencesSnapshot" JSONB,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "learner_contexts_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE
);

CREATE INDEX "learner_contexts_learnerId_idx" ON "learner_contexts"("learnerId");
CREATE INDEX "learner_contexts_sessionId_idx" ON "learner_contexts"("sessionId");
CREATE INDEX "learner_contexts_generatedAt_idx" ON "learner_contexts"("generatedAt");

-- Extend CharacterRole enum with new roles
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'ENGLISH_COACH';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'CODING_MENTOR';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'AI_MENTOR';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'CREATIVE_MENTOR';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'SCIENCE_MENTOR';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'ENTREPRENEURSHIP_MENTOR';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'STORY_GUIDE';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'CHALLENGE_MASTER';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'PROJECT_REVIEWER';
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'WORLD_GUIDE';
