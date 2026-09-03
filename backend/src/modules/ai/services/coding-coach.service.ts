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
import {
  HallucinationControlService,
  TEACHER_ESCALATION_HEDGE,
} from './hallucination-control.service';
import { PromptTemplateService } from './prompt-template.service';

/** Fixed coding-domain vocabulary so normal on-subject questions about
 * coding concepts are never false-flagged as off-topic, even when they
 * don't literally match the current mission/activity title. */
const CODING_DOMAIN_VOCABULARY = [
  'code', 'coding', 'bug', 'debug', 'error', 'function', 'variable', 'loop', 'array', 'string',
  'boolean', 'condition', 'python', 'javascript', 'scratch', 'blockly', 'html', 'css', 'algorithm',
  'syntax', 'program', 'programming', 'class', 'object', 'method', 'value', 'output', 'input',
];

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
    private hallucinationControl: HallucinationControlService,
    private promptTemplates: PromptTemplateService,
  ) {}

  /**
   * Off-topic check for a free-text learner message against the
   * learner's current mission/activity scope + coding domain vocabulary.
   * Returns the deterministic hedge line (no AI call spent) when the
   * message is flagged off-topic; null otherwise, meaning the caller
   * should proceed with a normal AI call (which itself still carries
   * the confidence/uncertainty guardrail in its prompt as a backstop).
   */
  private checkOffTopicOrNull(text: string, context: any, extra: Array<string | undefined>): string | null {
    const scopeKeywords = this.hallucinationControl.buildScopeKeywords(
      context,
      extra,
      CODING_DOMAIN_VOCABULARY,
    );
    const result = this.hallucinationControl.checkOffTopic(text, scopeKeywords);
    return result.offTopic ? TEACHER_ESCALATION_HEDGE : null;
  }

  /**
   * Provide debug assistance
   */
  async provideDebugAssistance(request: DebugAssistanceRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    const prompt = await this.buildDebugPrompt(request, context);

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

Be encouraging! Focus on growth, not perfection.

${this.hallucinationControl.getPromptGuardrail()}`;

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

Use analogies and real-world examples!

${this.hallucinationControl.getPromptGuardrail()}`;

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

    // v1 low-confidence-answer escalation: if the AI's own explanation
    // reads as hedged/uncertain on what is inherently a factual/
    // educational question ("explain this code"), don't hand the shaky
    // explanation to the child - swap in the safe teacher-escalation
    // hedge and persist a real SafetyEscalation record for review. See
    // HallucinationControlService / USAM_KIDS_ENGINE_GAP_MATRIX.md
    // ("AI Hallucination Control").
    const lowConfidence = await this.hallucinationControl.flagLowConfidenceIfNeeded({
      learnerId: request.learnerId,
      question: `Explain this ${request.language} code${request.specificLine ? ` (line ${request.specificLine})` : ''}`,
      answerText: response.content,
      source: 'coding-coach.explainCode',
    });
    if (lowConfidence) {
      return {
        code: request.code,
        explanation: lowConfidence.hedge,
        keyConceptsintroduced: [],
        analogies: [],
        groundedIn: groundedInFromContext(context as any),
        lowConfidenceHedge: true,
        matchedHedgingPhrases: lowConfidence.matchedPhrases,
      };
    }

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

    // Off-topic detector: stuckPoint is genuinely free-text (a learner
    // can type anything here, not just a description of their code
    // problem). If it shares no overlap with their current mission/
    // activity + coding vocabulary, short-circuit to the teacher-
    // escalation hedge without spending an AI call.
    const hedge = this.checkOffTopicOrNull(stuckPoint, context, [code?.slice(0, 200)]);
    if (hedge) {
      return {
        questions: [hedge],
        hint: 'Try answering these questions first, then try again!',
        offTopicHedge: true,
      };
    }

    const prompt = `You are helping a ${context.age}-year-old who is stuck on this code:

\`\`\`
${code}
\`\`\`

They say: "${stuckPoint}"

Ask 2-3 guiding questions that help them figure it out themselves. Don't give the answer!

Questions should:
- Help them think through the problem
- Build understanding
- Encourage experimentation

${this.hallucinationControl.getPromptGuardrail()}`;

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
   * Build debug prompt with age-appropriate guidance. AI Prompt/Policy
   * Engine: the base instruction block is read from the versioned
   * PromptTemplate table (key "coding-coach.debug") instead of being a
   * hardcoded string literal, with this exact text as the inline
   * fallback if the DB row is missing/inactive/errors.
   */
  private async buildDebugPrompt(request: DebugAssistanceRequest, context: any): Promise<string> {
    const base = await this.promptTemplates.getPrompt(
      'coding-coach.debug',
      `You are helping a {age}-year-old debug their {language} code.

Help them:
1. Understand what went wrong (in simple terms)
2. Where the problem is (specific line if possible)
3. How to fix it (step by step)
4. Why it works (learning moment)

Be encouraging! Bugs are learning opportunities.`,
    );

    const filled = base
      .replace(/\{age\}/g, String(context.age))
      .replace(/\{language\}/g, request.language);

    return `${filled}

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

${request.error ? `Error: ${request.error}` : ''}
${request.expectedBehavior ? `Expected: ${request.expectedBehavior}` : ''}

${this.hallucinationControl.getPromptGuardrail()}`;
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
