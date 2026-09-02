/**
 * Coding Coach Controller
 *
 * Exposes CodingCoachService (debug assistance, code review, explanation,
 * challenge generation) over HTTP. This service existed with real,
 * working logic but had ZERO reachable routes prior to this fix
 * (see docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md Part 5) - the
 * old `learning/coding.controller.ts` was a permanently-disabled empty
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
  CodingCoachService,
  DebugAssistanceRequest,
  CodeReviewRequest,
  CodeExplanationRequest,
} from './services/coding-coach.service';

@Controller('coding-coach')
@UseGuards(JwtAuthGuard)
export class CodingCoachController {
  constructor(private codingCoach: CodingCoachService) {}

  /**
   * Debug assistance for broken/erroring code
   */
  @Post('debug')
  async debug(
    @Body()
    body: Omit<DebugAssistanceRequest, 'learnerId'>,
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.codingCoach.provideDebugAssistance({
      ...body,
      learnerId,
    });
  }

  /**
   * Review submitted code for feedback
   */
  @Post('review')
  async review(
    @Body() body: Omit<CodeReviewRequest, 'learnerId'>,
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.codingCoach.reviewCode({ ...body, learnerId });
  }

  /**
   * Explain code line-by-line/concept-by-concept
   */
  @Post('explain')
  async explain(
    @Body() body: Omit<CodeExplanationRequest, 'learnerId'>,
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.codingCoach.explainCode({ ...body, learnerId });
  }

  /**
   * Generate a coding challenge for a concept
   */
  @Post('challenge')
  async challenge(
    @Body()
    body: { conceptId: string; difficulty: 'easy' | 'medium' | 'hard' },
    @Request() req: any,
  ) {
    const learnerId = req.user.learnerId;
    return this.codingCoach.generateChallenge(
      learnerId,
      body.conceptId,
      body.difficulty,
    );
  }
}
