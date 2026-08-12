/**
 * Character Service
 *
 * Manages character intelligence, personality, and context-aware behavior
 * Characters are not separate chatbots - they are AI interfaces over the learning engine
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LearnerContextService } from './learner-context.service';
import { AIProviderService } from './ai-provider.service';
import {
  AITaskType,
  AIContext,
} from './interfaces/ai-task.interface';
import { LearnerContext, CharacterContext } from './interfaces/learner-context.interface';

export interface CharacterResponse {
  message: string;
  mood?: string;
  suggestedActions?: string[];
  metadata?: any;
}

@Injectable()
export class CharacterService {
  constructor(
    private prisma: PrismaService,
    private learnerContext: LearnerContextService,
    private aiProvider: AIProviderService,
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
    // Get character and learner context
    const [character, learnerCtx, characterState] = await Promise.all([
      this.getCharacter(characterId),
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

    // Get AI response
    const aiResponse = await this.aiProvider.invoke({
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

    // Log interaction
    await this.logInteraction(
      characterId,
      learnerId,
      input,
      aiResponse.content,
      context,
    );

    return {
      message: aiResponse.content,
      mood: this.determineMood(learnerCtx),
      suggestedActions: this.suggestActions(learnerCtx, context),
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
