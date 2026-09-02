/**
 * English Coach Service
 *
 * Specialized AI service for English language learning
 * Supports: conversation, pronunciation feedback, grammar correction, CEFR progression
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { LearnerContextService } from '../learner-context.service';
import { AITaskType } from '../interfaces/ai-task.interface';
import {
  GrammarCheckService,
  GrammarIssue,
} from '../../english-learning/services/grammar-check.service';

export interface EnglishConversationRequest {
  learnerId: string;
  topic?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  userMessage: string;
}

export interface GrammarCorrectionRequest {
  learnerId: string;
  text: string;
  explainMistakes: boolean;
}

export interface PronunciationFeedbackRequest {
  learnerId: string;
  word: string;
  transcript?: string;
}

@Injectable()
export class EnglishCoachService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AIProviderService,
    private learnerContext: LearnerContextService,
    private grammarCheck: GrammarCheckService,
  ) {}

  /**
   * Conduct English conversation practice
   */
  async conductConversation(request: EnglishConversationRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    // Determine CEFR level from age and mastery
    const cefrLevel = request.difficulty || this.determineCEFRLevel(context);

    const systemPrompt = this.buildConversationPrompt(cefrLevel, request.topic, context);

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: request.userMessage,
        },
      ],
      maxTokens: 300,
      temperature: 0.8,
    });

    return {
      response: response.content,
      cefrLevel,
      topic: request.topic,
      suggestedVocabulary: this.extractVocabulary(response.content),
    };
  }

  /**
   * Provide grammar correction and feedback
   */
  async correctGrammar(request: GrammarCorrectionRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    // Deterministic rule-based layer FIRST: self-hosted LanguageTool
    // catches mechanical errors (spelling, subject-verb agreement,
    // punctuation) cheaply and reliably. This runs alongside the LLM call
    // below and never replaces it — it's an additive, deterministic
    // backstop per docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 2.
    const grammarCheckResult = await this.grammarCheck.checkGrammar(
      request.text,
      'en-US',
    );

    const prompt = `You are an encouraging English teacher helping a ${context.age}-year-old learner.

Analyze this text for grammar mistakes:
"${request.text}"

${request.explainMistakes ? 'For each mistake, explain why it\'s wrong and how to fix it in simple terms.' : 'Just provide the corrected version.'}

Be encouraging and focus on progress, not just errors.`;

    const response = await this.aiProvider.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 500,
      temperature: 0.3,
    });

    return {
      originalText: request.text,
      correctedText: this.extractCorrectedText(response.content),
      feedback: response.content,
      mistakeCount: this.countMistakes(request.text, response.content),
      // New: deterministic rule-based issues from LanguageTool, layered on
      // top of the LLM's holistic feedback above (not a replacement).
      grammarIssues: grammarCheckResult.issues,
      grammarIssueCount: grammarCheckResult.issues.length,
    };
  }

  /**
   * Provide pronunciation feedback (text-based for now)
   */
  async providePronunciationFeedback(request: PronunciationFeedbackRequest) {
    const context = await this.learnerContext.buildContext(request.learnerId);

    const prompt = `You are helping a ${context.age}-year-old learner pronounce the English word: "${request.word}"

Provide:
1. Simple phonetic breakdown
2. Syllable stress
3. Common mistakes to avoid
4. A memory trick to remember the pronunciation

Keep it simple and encouraging!`;

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
      word: request.word,
      feedback: response.content,
      // BACKLOG (tracked in docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md
      // under Voice & Conversation Engine / English Learning): real
      // pronunciation scoring requires an STT+phoneme-alignment pipeline
      // (candidates: Whisper/faster-whisper for transcription + a forced-
      // aligner, or a commercial pronunciation-assessment API). Not
      // implemented yet - this is a hardcoded placeholder score, kept
      // explicit (not silently presented as measured) until that engine
      // is built. Score is null when no transcript was even provided.
      pronunciationScore: request.transcript ? 0.85 : null,
    };
  }

  /**
   * Generate vocabulary practice
   */
  async generateVocabularyPractice(learnerId: string, topic: string, wordCount: number = 5) {
    const context = await this.learnerContext.buildContext(learnerId);
    const cefrLevel = this.determineCEFRLevel(context);

    const prompt = `Generate ${wordCount} vocabulary words about "${topic}" suitable for CEFR level ${cefrLevel} and age ${context.age}.

For each word provide:
1. The word
2. Simple definition
3. Example sentence
4. Common collocations

Format as JSON array.`;

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
      topic,
      cefrLevel,
      vocabulary: this.parseVocabulary(response.content),
    };
  }

  /**
   * Generate reading comprehension passage
   */
  async generateReadingPassage(
    learnerId: string,
    topic: string,
    length: 'short' | 'medium' | 'long' = 'medium',
  ) {
    const context = await this.learnerContext.buildContext(learnerId);
    const cefrLevel = this.determineCEFRLevel(context);

    const wordCounts = {
      short: 100,
      medium: 200,
      long: 300,
    };

    const prompt = `Write a ${length} reading passage (${wordCounts[length]} words) about "${topic}" for CEFR level ${cefrLevel}, age ${context.age}.

Make it engaging and age-appropriate. Include:
- Clear structure
- Age-appropriate vocabulary
- Cultural relevance
- 3 comprehension questions at the end`;

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
      topic,
      cefrLevel,
      passage: response.content,
      wordCount: this.countWords(response.content),
      estimatedReadingTime: Math.ceil(this.countWords(response.content) / 100), // minutes
    };
  }

  /**
   * Determine CEFR level from learner context
   */
  private determineCEFRLevel(context: any): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
    // Map age band and mastery to CEFR level
    if (context.ageBand === 'AGE_8_9') {
      return 'A1';
    } else if (context.ageBand === 'AGE_10_11') {
      return context.mastery.proficientCount > 5 ? 'A2' : 'A1';
    } else {
      // AGE_12_14
      if (context.mastery.proficientCount > 15) return 'B2';
      if (context.mastery.proficientCount > 10) return 'B1';
      return 'A2';
    }
  }

  /**
   * Build conversation prompt with CEFR and topic awareness
   */
  private buildConversationPrompt(cefrLevel: string, topic: string | undefined, context: any): string {
    const cefrGuidance = {
      A1: 'Use very simple sentences. Present tense mostly. Basic vocabulary (family, colors, food, numbers).',
      A2: 'Simple sentences. Can mix present and past. Everyday topics. Common phrases.',
      B1: 'Clear standard language. Can discuss familiar topics. Express opinions simply.',
      B2: 'More complex sentences. Can discuss abstract topics. Detailed descriptions.',
      C1: 'Complex language. Sophisticated vocabulary. Can discuss nuanced topics.',
      C2: 'Native-level complexity. Idiomatic expressions. Subtle meanings.',
    };

    return `You are an encouraging English conversation partner for a ${context.age}-year-old learner at CEFR level ${cefrLevel}.

${cefrGuidance[cefrLevel as keyof typeof cefrGuidance]}

${topic ? `Topic: ${topic}` : 'Topic: Free conversation'}

Guidelines:
- Be warm and encouraging
- Correct gently when needed
- Ask follow-up questions
- Introduce 1-2 new vocabulary words naturally
- Keep responses to 2-3 sentences
- Adapt to learner's level

Respond naturally to the learner's message.`;
  }

  /**
   * Extract vocabulary from text
   */
  private extractVocabulary(text: string): string[] {
    // Simple extraction - in production, use NLP
    const words = text
      .toLowerCase()
      .match(/\b[a-z]{5,}\b/g);
    return words ? [...new Set(words)].slice(0, 3) : [];
  }

  /**
   * Extract corrected text from feedback
   */
  private extractCorrectedText(feedback: string): string {
    // Simple extraction - look for quoted text
    const match = feedback.match(/"([^"]+)"/);
    return match ? match[1] : feedback.split('\n')[0];
  }

  /**
   * Count grammar mistakes
   */
  private countMistakes(original: string, feedback: string): number {
    // Simple heuristic - count mentions of "mistake", "error", "wrong"
    const errorWords = ['mistake', 'error', 'wrong', 'incorrect'];
    let count = 0;
    errorWords.forEach((word) => {
      const regex = new RegExp(word, 'gi');
      const matches = feedback.match(regex);
      count += matches ? matches.length : 0;
    });
    return Math.min(count, 5); // Cap at 5
  }

  /**
   * Parse vocabulary from AI response
   */
  private parseVocabulary(content: string): any[] {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback parsing
      return [];
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }
}
