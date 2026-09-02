/**
 * English Coach Controller
 *
 * Exposes EnglishCoachService (conversation practice, grammar correction,
 * pronunciation feedback, vocabulary practice, reading passages) over
 * HTTP. This service existed with real, working logic but had ZERO
 * reachable routes prior to this fix (see
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md Part 5) - the old
 * `learning/english.controller.ts` was a permanently-disabled empty
 * class. This controller replaces that gap without touching the disabled
 * file's module wiring (left disabled/inert on purpose, see commit note).
 */

import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  EnglishCoachService,
  EnglishConversationRequest,
  GrammarCorrectionRequest,
  PronunciationFeedbackRequest,
} from './services/english-coach.service';

@Controller('english-coach')
@UseGuards(JwtAuthGuard)
export class EnglishCoachController {
  constructor(private englishCoach: EnglishCoachService) {}

  /**
   * Conversation practice turn
   */
  @Post('conversation')
  async conversation(
    @Body() body: Omit<EnglishConversationRequest, 'learnerId'>,
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.englishCoach.conductConversation({ ...body, learnerId });
  }

  /**
   * Grammar correction/feedback
   */
  @Post('grammar')
  async grammar(
    @Body() body: Omit<GrammarCorrectionRequest, 'learnerId'>,
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.englishCoach.correctGrammar({ ...body, learnerId });
  }

  /**
   * Pronunciation feedback (text-based placeholder, see service note re:
   * pronunciationScore hardcoding - real STT-based scoring is a tracked
   * backlog item under the Voice & Conversation Engine gap)
   */
  @Post('pronunciation')
  async pronunciation(
    @Body() body: Omit<PronunciationFeedbackRequest, 'learnerId'>,
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.englishCoach.providePronunciationFeedback({
      ...body,
      learnerId,
    });
  }

  /**
   * Generate vocabulary practice set
   */
  @Post('vocabulary')
  async vocabulary(
    @Body() body: { topic: string; wordCount?: number },
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.englishCoach.generateVocabularyPractice(
      learnerId,
      body.topic,
      body.wordCount,
    );
  }

  /**
   * Generate a reading comprehension passage
   */
  @Post('reading')
  async reading(
    @Body() body: { topic: string; length?: 'short' | 'medium' | 'long' },
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.englishCoach.generateReadingPassage(
      learnerId,
      body.topic,
      body.length,
    );
  }
}
