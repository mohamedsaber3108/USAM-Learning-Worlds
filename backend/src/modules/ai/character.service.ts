/**
 * Character Service
 *
 * Manages character intelligence, personality, and context-aware behavior
 * Characters are not separate chatbots - they are AI interfaces over the learning engine
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LearnerContextService } from './learner-context.service';
import { AIProviderService } from './ai-provider.service';
import {
  AITaskType,
  AIContext,
} from './interfaces/ai-task.interface';
import { LearnerContext, CharacterContext } from './interfaces/learner-context.interface';
import { CharacterSafetyService } from './services/character-safety.service';
import { pickFallbackLine } from './services/character-fallback-responses';

/** Fallback copy shown instead of the raw AI text when the safety layer intervenes. */
const SAFETY_FALLBACK_BLOCKED =
  "Let's talk about something else! Would you like to try a mission?";
const SAFETY_FALLBACK_ESCALATION =
  'It might help to talk to a parent or trusted adult about that. Want to try a mission together instead?';

export interface CharacterResponse {
  message: string;
  mood?: string;
  suggestedActions?: string[];
  metadata?: any;
  /**
   * True when this response is a pre-written, character-appropriate canned
   * line served because the live Bedrock call failed (e.g. expired/invalid
   * AWS credentials, throttling, network error) - NOT a real AI-generated
   * reply. The frontend can use this to visually distinguish the message
   * (e.g. a small "offline" indicator) without breaking the chat experience.
   * Absent/false on normal AI-generated responses.
   */
  isFallback?: boolean;
}

@Injectable()
export class CharacterService {
  private readonly logger = new Logger(CharacterService.name);

  constructor(
    private prisma: PrismaService,
    private learnerContext: LearnerContextService,
    private aiProvider: AIProviderService,
    private characterSafety: CharacterSafetyService,
  ) {}

  /**
   * Get character by ID with full details
   */
  async getCharacter(characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  /**
   * List all active characters, optionally filtered by role.
   * Backs GET /characters.
   */
  async getAllCharacters(role?: string) {
    return this.prisma.character.findMany({
      where: {
        isActive: true,
        ...(role ? { role: role as any } : {}),
      },
      select: {
        id: true,
        name: true,
        role: true,
        personality: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Names of the 4 core characters, always visible from day 1. */
  private static readonly CORE_CHARACTER_NAMES = ['Azouz', 'Zein', 'Luma', 'Codey'];

  /**
   * Evaluate, per real learner progress, which characters are currently
   * unlocked for a given learner. Core characters are always included.
   * Every unlockable character has its own real trigger condition
   * evaluated against real tables (mastery/evidence/mission
   * runs/projects/xp/domain navigation) - no stub / all-true logic.
   *
   * Backs GET /characters/unlocked.
   */
  async getUnlockedCharactersForLearner(learnerId: string) {
    const allCharacters = await this.prisma.character.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        personality: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    // Pre-fetch the signals we need once, then evaluate each character's
    // trigger against them. Domain names below match the seeded `domains`
    // table (prisma/seed.ts).
    const domainEngagement = await this.getDomainEngagementSet(learnerId);
    const [
      projectCount,
      missionCompletionCount,
      distinctDomainCount,
      hasAnyXpGain,
      learner,
    ] = await Promise.all([
      this.prisma.project.count({ where: { learnerId } }),
      this.prisma.missionRun.count({ where: { learnerId, status: 'COMPLETED' } }),
      Promise.resolve(domainEngagement.size),
      this.hasAnyXpGain(learnerId),
      this.prisma.learner.findUnique({ where: { id: learnerId }, select: { ageBand: true } }),
    ]);

    const ageBand = learner?.ageBand ?? null;
    const isAgeBandAtLeast10 = ageBand === 'AGE_10_11' || ageBand === 'AGE_12_14';

    const unlockEvaluators: Record<string, () => boolean> = {
      // Nova (AI_MENTOR) - unlocked once the learner has any evidence of
      // AI-Literacy-domain engagement (an AI Literacy Concept-tagged
      // learning event, or mastery/evidence tagged to the AI-literacy
      // area). We track this via domain engagement's 'ai-literacy' key.
      Nova: () => domainEngagement.has('ai-literacy'),
      // Mira (CREATIVE_MENTOR) - first Arts or Creativity domain touch.
      Mira: () => domainEngagement.has('arts') || domainEngagement.has('creativity'),
      // Rami (SCIENCE_MENTOR) - first Science domain touch.
      Rami: () => domainEngagement.has('science'),
      // Faris (CHALLENGE_MASTER) - first Critical-Thinking domain touch.
      Faris: () => domainEngagement.has('critical-thinking'),
      // Tala (PROJECT_REVIEWER) - first Project submission/showcase.
      Tala: () => projectCount > 0,
      // Adam (ENTREPRENEURSHIP_MENTOR) - first Entrepreneurship domain touch.
      Adam: () => domainEngagement.has('entrepreneurship'),
      // Byte (DIGITAL_GUARDIAN) - first Digital-Literacy touch, OR the
      // learner is old enough (10+) to warrant proactive digital-safety
      // guidance even before they've explicitly engaged with the domain.
      Byte: () => domainEngagement.has('digital-literacy') || isAgeBandAtLeast10,
      // Nour (MENTOR / Financial-Life-Skills) - first Financial-Literacy touch.
      Nour: () => domainEngagement.has('financial-literacy'),
      // Rex (CHALLENGER) - leaderboard views aren't tracked server-side,
      // so the practical proxy is "has the learner earned any XP yet?"
      Rex: () => hasAnyXpGain,
      // Zara (STORY_GUIDE) - first completed Mission.
      Zara: () => missionCompletionCount > 0,
      // Atlas (WORLD_GUIDE) - has navigated across 2+ distinct domains/worlds.
      Atlas: () => distinctDomainCount >= 2,
    };

    return allCharacters.filter((c) => {
      if (CharacterService.CORE_CHARACTER_NAMES.includes(c.name)) {
        return true;
      }
      const evaluator = unlockEvaluators[c.name];
      return evaluator ? evaluator() : false;
    });
  }

  /**
   * Build the set of domain slugs a learner has real engagement with,
   * combining signals across mastery/evidence, mission-linked activity
   * competencies, and cross-curricular concept models
   * (AILiteracyConcept/EntrepreneurshipConcept/FinancialLiteracyConcept)
   * via LearningEvent entries recorded against them.
   */
  private async getDomainEngagementSet(learnerId: string): Promise<Set<string>> {
    const engaged = new Set<string>();

    // Signal 1: MasteryRecord rows (created as soon as a learner starts
    // interacting with a competency) joined up to their Domain slug.
    const masteryDomains = await this.prisma.$queryRaw<Array<{ slug: string }>>`
      SELECT DISTINCT d.slug AS slug
      FROM mastery_records m
      JOIN competencies c ON c.id = m."competencyId"
      JOIN skills s ON s.id = c."skillId"
      JOIN domains d ON d.id = s."domainId"
      WHERE m."learnerId" = ${learnerId}
    `;
    masteryDomains.forEach((r) => engaged.add(r.slug));

    // Signal 2: Evidence rows joined the same way (covers activity-level
    // engagement that may predate a mastery-state change).
    const evidenceDomains = await this.prisma.$queryRaw<Array<{ slug: string }>>`
      SELECT DISTINCT d.slug AS slug
      FROM evidence e
      JOIN competencies c ON c.id = e."competencyId"
      JOIN skills s ON s.id = c."skillId"
      JOIN domains d ON d.id = s."domainId"
      WHERE e."learnerId" = ${learnerId}
    `;
    evidenceDomains.forEach((r) => engaged.add(r.slug));

    // Signal 3: LearningEvent rows recorded against the cross-curricular
    // concept models (AI Literacy / Entrepreneurship / Financial Literacy)
    // and Digital-Literacy concepts, whenever those flows record
    // entityType/entityId pointing at those concept IDs.
    const aiLiteracyIds = await this.prisma.aILiteracyConcept.findMany({ select: { id: true } });
    const entrepreneurshipIds = await this.prisma.entrepreneurshipConcept.findMany({ select: { id: true } });
    const financialLiteracyIds = await this.prisma.financialLiteracyConcept.findMany({ select: { id: true } });

    const conceptEvents = await this.prisma.learningEvent.findMany({
      where: {
        learnerId,
        entityId: {
          in: [
            ...aiLiteracyIds.map((c) => c.id),
            ...entrepreneurshipIds.map((c) => c.id),
            ...financialLiteracyIds.map((c) => c.id),
          ],
        },
      },
      select: { entityId: true },
    });

    const aiLiteracyIdSet = new Set(aiLiteracyIds.map((c) => c.id));
    const entrepreneurshipIdSet = new Set(entrepreneurshipIds.map((c) => c.id));
    const financialLiteracyIdSet = new Set(financialLiteracyIds.map((c) => c.id));

    for (const ev of conceptEvents) {
      if (!ev.entityId) continue;
      if (aiLiteracyIdSet.has(ev.entityId)) engaged.add('ai-literacy');
      if (entrepreneurshipIdSet.has(ev.entityId)) engaged.add('entrepreneurship');
      if (financialLiteracyIdSet.has(ev.entityId)) engaged.add('financial-literacy');
    }

    // Digital-literacy has no dedicated concept model yet in this schema;
    // treat any LearningEvent explicitly tagged entityType 'DIGITAL_LITERACY'
    // as engagement (future content modules can record this directly).
    const digitalLiteracyEvents = await this.prisma.learningEvent.count({
      where: { learnerId, entityType: 'DIGITAL_LITERACY' },
    });
    if (digitalLiteracyEvents > 0) engaged.add('digital-literacy');

    return engaged;
  }

  /** True if the learner has ever earned XP (used as Rex's practical unlock trigger). */
  private async hasAnyXpGain(learnerId: string): Promise<boolean> {
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId },
      select: { totalXP: true },
    });
    if (progression && progression.totalXP > 0) return true;

    const xpGainCount = await this.prisma.xPGain.count({ where: { learnerId } });
    return xpGainCount > 0;
  }

  /**
   * Get character state for a specific learner
   */
  async getCharacterState(
    characterId: string,
    learnerId: string,
  ): Promise<CharacterContext> {
    const character = await this.getCharacter(characterId);

    // Get or create character state
    const interactions = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM character_interactions
      WHERE "learnerId" = ${learnerId}
      AND "characterId" = ${characterId}
    ` as any[];

    const interactionCount = interactions[0]?.count || 0;

    const lastInteraction = await this.prisma.$queryRaw`
      SELECT "createdAt"
      FROM character_interactions
      WHERE "learnerId" = ${learnerId}
      AND "characterId" = ${characterId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    ` as any[];

    // Calculate relationship level based on interactions (1-5)
    const relationshipLevel = Math.min(
      5,
      Math.floor(interactionCount / 10) + 1,
    );

    return {
      characterId,
      characterName: character.name,
      characterRole: character.role,
      relationshipLevel,
      interactionCount,
      lastInteraction: lastInteraction[0]?.createdAt,
    };
  }

  /**
   * Generate character response based on context
   */
  async generateResponse(
    characterId: string,
    learnerId: string,
    input: string,
    context?: {
      missionId?: string;
      activityId?: string;
      projectId?: string;
      situation?: string;
    },
  ): Promise<CharacterResponse> {
    // Fetch the character early (cheap lookup) so we have its name/identity
    // available for BOTH the safety-layer branch below and the Bedrock
    // catch block further down - both need to pick a personality-matched
    // fallback line rather than a generic one.
    const character = await this.getCharacter(characterId);

    // --- Character Safety Policy layer: pre-check the learner's input
    // BEFORE spending a generation call on it. See
    // services/character-safety.service.ts for the 5-state model; this
    // is a dedicated layer on top of (not a replacement for) the
    // existing ModerationService. ---
    const inputSafety = await this.characterSafety.evaluateSafety(
      characterId,
      learnerId,
      input,
    );

    if (inputSafety.state === 'blocked' || inputSafety.state === 'escalation_required') {
      // Distinguish a REAL safety verdict (actual unsafe content) from an
      // underlying infrastructure failure inside the moderation pipeline
      // itself (ModerationService also calls Bedrock, and fails CLOSED
      // with a generic "talk to a trusted adult" message on any error -
      // including the known AWS-credential outage). A learner tapping a
      // character during that outage should still get THIS character's
      // own charming fallback line, not a scary generic safety message
      // for content that was never actually evaluated.
      const isInfraFailure = inputSafety.reasons.some((r) =>
        r.toLowerCase().includes('moderation service error'),
      );

      if (isInfraFailure) {
        const fallbackMessage = pickFallbackLine(character.name);
        this.logger.error(
          `Safety/moderation pipeline errored (likely Bedrock outage) for character ${character.name} (${characterId}), learner ${learnerId}: ${inputSafety.reasons.join('; ')}`,
        );
        await this.logInteraction(characterId, learnerId, input, fallbackMessage, context);
        return {
          message: fallbackMessage,
          mood: 'neutral',
          suggestedActions: ['BROWSE_MISSIONS'],
          metadata: { fallbackReason: 'ai_provider_error' },
          isFallback: true,
        };
      }

      const fallback =
        inputSafety.state === 'blocked' ? SAFETY_FALLBACK_BLOCKED : SAFETY_FALLBACK_ESCALATION;
      return {
        message: fallback,
        mood: 'neutral',
        suggestedActions: ['BROWSE_MISSIONS'],
        metadata: { safetyState: inputSafety.state, safetyReasons: inputSafety.reasons },
      };
    }

    // Get learner context and character state (character itself was
    // already fetched above, before the safety check).
    const [learnerCtx, characterState] = await Promise.all([
      this.learnerContext.buildContext(learnerId),
      this.getCharacterState(characterId, learnerId),
    ]);

    // Build AI task with full context
    const systemPrompt = this.buildCharacterSystemPrompt(
      character,
      learnerCtx,
      characterState,
    );

    const task = {
      type: AITaskType.CHARACTER_RESPONSE,
      input: {
        message: input,
        situation: context?.situation,
      },
      context: {
        learnerId,
        characterId,
        ...context,
      },
    };

    // Get AI response. This is the live Bedrock call - it can fail for
    // reasons entirely outside the learner's control (expired/invalid AWS
    // credentials, throttling, network blips). A child tapping a character
    // must never see a raw error or a dead chat, so any failure here is
    // caught and swapped for one of that character's own pre-written,
    // personality-appropriate fallback lines (see
    // services/character-fallback-responses.ts) instead of propagating.
    let aiResponse: { content: string };
    try {
      aiResponse = await this.aiProvider.invoke({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: input,
          },
        ],
        maxTokens: 500,
        temperature: 0.8, // Higher temperature for more varied personality
      });
    } catch (error) {
      // Log the real error server-side so it stays debuggable - never
      // swallow it silently, just don't surface it to the learner.
      this.logger.error(
        `Bedrock call failed for character ${character.name} (${characterId}), learner ${learnerId}: ${error?.message}`,
        error?.stack,
      );

      const fallbackMessage = pickFallbackLine(character.name);

      await this.logInteraction(
        characterId,
        learnerId,
        input,
        fallbackMessage,
        context,
      );

      return {
        message: fallbackMessage,
        mood: 'neutral',
        suggestedActions: ['BROWSE_MISSIONS'],
        metadata: { fallbackReason: 'ai_provider_error' },
        isFallback: true,
      };
    }

    // --- Character Safety Policy layer: re-check the generated response
    // BEFORE it goes back to the learner. Both directions matter - a
    // benign input can still yield an unsafe AI response. ---
    const responseSafety = await this.characterSafety.evaluateSafety(
      characterId,
      learnerId,
      input,
      aiResponse.content,
    );

    const finalMessage =
      responseSafety.state === 'blocked'
        ? SAFETY_FALLBACK_BLOCKED
        : responseSafety.state === 'escalation_required'
          ? SAFETY_FALLBACK_ESCALATION
          : aiResponse.content;

    // Log interaction (never logs the raw text if it was suppressed for safety)
    await this.logInteraction(
      characterId,
      learnerId,
      input,
      finalMessage,
      context,
    );

    return {
      message: finalMessage,
      mood: this.determineMood(learnerCtx),
      suggestedActions: this.suggestActions(learnerCtx, context),
      metadata:
        responseSafety.state !== 'safe'
          ? { safetyState: responseSafety.state, safetyReasons: responseSafety.reasons }
          : undefined,
    };
  }

  /**
   * Build character system prompt with personality and context
   */
  private buildCharacterSystemPrompt(
    character: any,
    learnerContext: LearnerContext,
    characterState: CharacterContext,
  ): string {
    const personality = character.personality;
    const basePrompt = character.systemPrompt;

    // Build age-appropriate instruction
    const ageInstruction = this.getAgeAppropriateInstructions(
      learnerContext.ageBand,
    );

    // Build learning state context
    const learningState = this.formatLearningState(learnerContext);

    // Build relationship context
    const relationshipContext = this.formatRelationshipContext(characterState);

    return `${basePrompt}

${ageInstruction}

LEARNER CONTEXT:
${learningState}

${relationshipContext}

PERSONALITY TRAITS:
${JSON.stringify(personality, null, 2)}

IMPORTANT GUIDELINES:
1. Never claim to be a real friend or express need for the learner
2. Focus on learning goals, not social dependency
3. Be warm and encouraging without creating unhealthy attachment
4. Always prioritize educational objectives
5. Use age-appropriate language and concepts
6. Reference their current learning progress naturally
7. Celebrate effort and growth, not just correctness

Respond as ${character.name} in character, keeping responses concise (2-3 sentences for ages 8-9, up to 5 sentences for ages 12-14).`;
  }

  /**
   * Get age-appropriate interaction instructions
   */
  private getAgeAppropriateInstructions(ageBand: string): string {
    switch (ageBand) {
      case 'AGE_8_9':
        return `AGE: 8-9 years
- Use simple, concrete language
- Short sentences (10-15 words max)
- Visual and playful examples
- Lots of encouragement
- Break complex ideas into tiny steps`;

      case 'AGE_10_11':
        return `AGE: 10-11 years
- Clear but more sophisticated language
- Can handle longer explanations
- Introduce abstract concepts with examples
- Encourage independence
- Ask guiding questions`;

      case 'AGE_12_14':
        return `AGE: 12-14 years
- Use technical vocabulary where appropriate
- Encourage critical thinking
- Support deeper exploration
- Respect growing autonomy
- Connect to real-world applications`;

      default:
        return 'AGE: 10-11 years (default)';
    }
  }

  /**
   * Format learning state for character context
   */
  private formatLearningState(context: LearnerContext): string {
    const parts = [];

    parts.push(`Name: ${context.displayName}`);
    parts.push(`Level: ${context.mastery.proficientCount} competencies mastered`);

    if (context.mastery.strengths.length > 0) {
      parts.push(`Strengths: ${context.mastery.strengths.join(', ')}`);
    }

    if (context.mastery.struggles.length > 0) {
      parts.push(`Working on: ${context.mastery.struggles.join(', ')}`);
    }

    if (context.recentPerformance.activitiesCompleted > 0) {
      parts.push(
        `Recent success rate: ${Math.round(context.recentPerformance.successRate * 100)}%`,
      );
    }

    if (context.currentMission) {
      parts.push(`Current mission: ${context.currentMission.title}`);
    }

    if (context.currentProject) {
      parts.push(`Working on project: ${context.currentProject.title}`);
    }

    return parts.join('\n');
  }

  /**
   * Format relationship context
   */
  private formatRelationshipContext(state: CharacterContext): string {
    if (state.interactionCount === 0) {
      return 'RELATIONSHIP: This is your first interaction with this learner. Introduce yourself warmly.';
    }

    if (state.interactionCount < 5) {
      return 'RELATIONSHIP: Getting to know each other. Be warm and encouraging.';
    }

    if (state.interactionCount < 20) {
      return 'RELATIONSHIP: Familiar. You can reference past interactions naturally.';
    }

    return 'RELATIONSHIP: Well-established. You know their learning journey well.';
  }

  /**
   * Determine character mood based on learner state
   */
  private determineMood(context: LearnerContext): string {
    // Simple mood determination logic
    if (context.recentPerformance.successRate >= 0.8) {
      return 'celebrating';
    }

    if (context.recentPerformance.successRate < 0.5) {
      return 'encouraging';
    }

    if (context.mastery.needsReviewCount > 3) {
      return 'focused';
    }

    return 'neutral';
  }

  /**
   * Suggest actions based on context
   */
  private suggestActions(
    context: LearnerContext,
    situationContext?: any,
  ): string[] {
    const actions: string[] = [];

    if (context.mastery.needsReviewCount > 0) {
      actions.push('START_REVIEW');
    }

    if (!context.currentMission && !context.currentProject) {
      actions.push('BROWSE_MISSIONS');
    }

    if (context.recentPerformance.successRate >= 0.8) {
      actions.push('TRY_CHALLENGE');
    }

    return actions.slice(0, 2); // Max 2 suggestions
  }

  /**
   * Log character interaction
   */
  private async logInteraction(
    characterId: string,
    learnerId: string,
    request: string,
    response: string,
    context?: any,
  ) {
    // Use raw query since CharacterInteraction table doesn't exist yet in schema
    // This will be added in the migration
    try {
      await this.prisma.$executeRaw`
        INSERT INTO character_interactions
        ("id", "learnerId", "characterId", "interactionType", "context", "request", "response", "createdAt")
        VALUES (
          gen_random_uuid(),
          ${learnerId},
          ${characterId},
          'chat',
          ${JSON.stringify(context)}::jsonb,
          ${request},
          ${response},
          NOW()
        )
      `;
    } catch (error) {
      // Table doesn't exist yet - skip logging for now
      // Will work after migration
    }
  }
}
