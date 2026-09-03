/**
 * Coding Coach Service
 *
 * Specialized AI service for coding education
 * Supports: debug assistance, code review, concept explanation, guided coding
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { LearnerContextService } from '../learner-context.service';

export interface DebugAssistanceRequest {
  learnerId: string;
  code: string;
  language: 'scratch' | 'blockly' | 'python' | 'javascript' | 'html' | 'css';
  error?: string;
  expectedBehavior?: string;
}

export interface CodeReviewRequest {
  learnerId: string;
  code: string;
  language: string;
  objectiveId?: string;
}

/**
 * Content-citation grounding: real Mission/Activity IDs from the
 * learner's current context (LearnerContextService) that informed a
 * coaching response - closes the "no retrieval/citation grounding" gap
 * flagged for the AI Tutor/Companion Engine in
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md. Not fabricated -
 * omitted entirely when the learner has no active mission/activity.
 */
function groundedInFromContext(context: {
  currentMission?: { id: string };
  currentActivity?: { id: string };
}): string[] {
  const ids: string[] = [];
  if (context?.currentMission?.id) ids.push(`mission:${context.currentMission.id}`);
  if (context?.currentActivity?.id) ids.push(`activity:${context.currentActivity.id}`);
  return ids;
}

export interface CodeExplanationRequest {
  learnerId: string;
  code: string;
  language: string;
  specificLine?: number;
}

@Injectable()
export class CodingCoachService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AIProviderService,
    private learnerContext: LearnerContextService,
  ) {}

  /**
   * Provide debug assistance
   */
  async provideDebugAssistance(request: DebugAssistanceRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    const prompt = this.buildDebugPrompt(request, context);

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 600,
      temperature: 0.3,
    });

    return {
      diagnosis: response.content,
      suggestedFix: this.extractSuggestedFix(response.content),
      explanation: this.extractExplanation(response.content),
      learningPoints: this.extractLearningPoints(response.content),
      groundedIn: groundedInFromContext(context as any),
    };
  }

  /**
   * Review code and provide feedback
   */
  async reviewCode(request: CodeReviewRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    const prompt = `You are reviewing code written by a ${context.age}-year-old learner.

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Provide:
1. What works well (be specific and encouraging)
2. Suggestions for improvement (focus on 1-2 key points)
3. One new concept they could learn next

Be encouraging! Focus on growth, not perfection.`;

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 500,
      temperature: 0.5,
    });

    return {
      code: request.code,
      feedback: response.content,
      strengths: this.extractStrengths(response.content),
      improvements: this.extractImprovements(response.content),
      nextConcept: this.extractNextConcept(response.content),
      codeQualityScore: this.assessCodeQuality(request.code, request.language),
      groundedIn: groundedInFromContext(context as any),
    };
  }

  /**
   * Explain code to learner
   */
  async explainCode(request: CodeExplanationRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    const ageGuidance = this.getAgeAppropriateExplanationGuidance(context.ageBand);

    const prompt = `Explain this ${request.language} code to a ${context.age}-year-old:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.specificLine ? `Focus especially on line ${request.specificLine}.` : ''}

${ageGuidance}

Use analogies and real-world examples!`;

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 500,
      temperature: 0.7,
    });

    return {
      code: request.code,
      explanation: response.content,
      keyConceptsintroduced: this.extractKeyConcepts(response.content),
      analogies: this.extractAnalogies(response.content),
      groundedIn: groundedInFromContext(context as any),
    };
  }

  /**
   * Generate coding challenge
   */
  async generateChallenge(
    learnerId: string,
    conceptId: string,
    difficulty: 'easy' | 'medium' | 'hard',
  ) {
    const context = await this.learnerContext.buildContext(learnerId);

    // Get concept details
    const concept = await this.prisma.codingConcept.findUnique({
      where: { id: conceptId },
    });

    if (!concept) {
      throw new Error('Coding concept not found');
    }

    const prompt = `Create a coding challenge for a ${context.age}-year-old learning "${concept.name}".

Difficulty: ${difficulty}

Include:
1. Clear problem statement
2. Example input/output
3. Starter code
4. Hints (3 progressive hints)
5. Test cases

Make it fun and relatable!`;

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 800,
      temperature: 0.8,
    });

    return {
      concept: concept.name,
      difficulty,
      challenge: response.content,
      estimatedTime: this.estimateChallengeTime(difficulty),
    };
  }

  /**
   * Provide Socratic guidance (ask questions instead of giving answers)
   */
  async provideSocraticGuidance(learnerId: string, code: string, stuckPoint: string) {
    const context = await this.learnerContext.buildContext(learnerId);

    const prompt = `A ${context.age}-year-old is stuck on this code:

\`\`\`
${code}
\`\`\`

They say: "${stuckPoint}"

Ask 2-3 guiding questions that help them figure it out themselves. Don't give the answer!

Questions should:
- Help them think through the problem
- Build understanding
- Encourage experimentation`;

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 300,
      temperature: 0.7,
    });

    return {
      questions: this.extractQuestions(response.content),
      hint: 'Try answering these questions first, then try again!',
    };
  }

  /**
   * Suggest next project
   */
  async suggestNextProject(learnerId: string) {
    const context = await this.learnerContext.buildContext(learnerId);

    // Get learner's coding concepts mastery
    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        competency: {
          skill: {
            name: 'Coding', // Adjust based on actual skill name
          },
        },
        state: {
          in: ['PROFICIENT', 'MASTERED'],
        },
      },
      include: {
        competency: true,
      },
    });

    const masteredConcepts = masteryRecords.map((r) => r.competency.name).join(', ');

    const prompt = `Suggest a coding project for a ${context.age}-year-old who has mastered: ${masteredConcepts || 'basic concepts'}.

The project should:
- Build on what they know
- Introduce 1-2 new concepts
- Be completable in 2-4 hours
- Create something they can share/showcase
- Be fun and personally relevant

Provide:
1. Project idea
2. What they'll learn
3. Project breakdown (3-5 steps)`;

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 600,
      temperature: 0.9,
    });

    return {
      projectIdea: response.content,
      skillLevel: this.determineSkillLevel(context),
      estimatedHours: 3,
    };
  }

  /**
   * Build debug prompt with age-appropriate guidance
   */
  private buildDebugPrompt(request: DebugAssistanceRequest, context: any): string {
    return `You are helping a ${context.age}-year-old debug their ${request.language} code.

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

${request.error ? `Error: ${request.error}` : ''}
${request.expectedBehavior ? `Expected: ${request.expectedBehavior}` : ''}

Help them:
1. Understand what went wrong (in simple terms)
2. Where the problem is (specific line if possible)
3. How to fix it (step by step)
4. Why it works (learning moment)

Be encouraging! Bugs are learning opportunities.`;
  }

  /**
   * Get age-appropriate explanation guidance
   */
  private getAgeAppropriateExplanationGuidance(ageBand: string): string {
    const guidance = {
      AGE_8_9: 'Use very simple language. Compare to toys, games, or everyday activities. Avoid technical jargon.',
      AGE_10_11: 'Use clear language. Can introduce simple technical terms with explanations. Use relatable examples.',
      AGE_12_14: 'Can use more technical language. Connect to real-world applications. Explain the "why" behind concepts.',
    };

    return guidance[ageBand as keyof typeof guidance] || guidance.AGE_10_11;
  }

  /**
   * Extract sections from AI response (simplified parsing)
   */
  private extractSuggestedFix(content: string): string {
    const lines = content.split('\n');
    const fixLine = lines.findIndex((line) => line.toLowerCase().includes('fix'));
    return fixLine >= 0 ? lines.slice(fixLine, fixLine + 3).join('\n') : '';
  }

  private extractExplanation(content: string): string {
    return content.split('\n').slice(0, 3).join('\n');
  }

  private extractLearningPoints(content: string): string[] {
    const points: string[] = [];
    const lines = content.split('\n');
    lines.forEach((line) => {
      if (line.match(/^[\d\-\*\.]/)) {
        points.push(line.trim());
      }
    });
    return points.slice(0, 3);
  }

  private extractStrengths(content: string): string[] {
    return this.extractLearningPoints(content);
  }

  private extractImprovements(content: string): string[] {
    return this.extractLearningPoints(content);
  }

  private extractNextConcept(content: string): string {
    const lines = content.split('\n');
    const conceptLine = lines.find((line) => line.toLowerCase().includes('next') || line.toLowerCase().includes('learn'));
    return conceptLine || 'Keep practicing!';
  }

  private extractKeyConcepts(content: string): string[] {
    return this.extractLearningPoints(content);
  }

  private extractAnalogies(content: string): string[] {
    const analogies: string[] = [];
    const lines = content.split('\n');
    lines.forEach((line) => {
      if (line.toLowerCase().includes('like') || line.toLowerCase().includes('imagine')) {
        analogies.push(line.trim());
      }
    });
    return analogies;
  }

  private extractQuestions(content: string): string[] {
    const questions: string[] = [];
    const lines = content.split('\n');
    lines.forEach((line) => {
      if (line.includes('?')) {
        questions.push(line.trim());
      }
    });
    return questions;
  }

  /**
   * Assess code quality (simple heuristic)
   */
  private assessCodeQuality(code: string, language: string): number {
    let score = 0.7; // Base score

    // Length check (not too short, not too long)
    const lines = code.split('\n').length;
    if (lines > 5 && lines < 50) score += 0.1;

    // Has comments
    if (code.includes('//') || code.includes('#')) score += 0.1;

    // Has functions/structure
    if (code.includes('function') || code.includes('def')) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Estimate challenge time
   */
  private estimateChallengeTime(difficulty: string): number {
    return { easy: 15, medium: 30, hard: 45 }[difficulty] || 30;
  }

  /**
   * Determine skill level
   */
  private determineSkillLevel(context: any): string {
    if (context.mastery.proficientCount > 10) return 'Advanced Beginner';
    if (context.mastery.proficientCount > 5) return 'Beginner';
    return 'Just Starting';
  }
}
