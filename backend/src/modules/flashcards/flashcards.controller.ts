import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private flashcardsService: FlashcardsService) {}

  @Get('domain/:domainId')
  async listByDomain(@Param('domainId') domainId: string) {
    return this.flashcardsService.listByDomain(domainId);
  }

  @Get('due')
  async getDueCards(
    @CurrentUser() user: any,
    @Query('domainId') domainId?: string,
    @Query('limit') limit?: string,
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners can study flashcards');
    return this.flashcardsService.getDueCards(learnerId, domainId, limit ? parseInt(limit, 10) : 20);
  }

  @Post(':id/review')
  async recordReview(
    @CurrentUser() user: any,
    @Param('id') flashcardId: string,
    @Body() dto: { remembered: boolean },
  ) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners can review flashcards');
    return this.flashcardsService.recordReview(learnerId, flashcardId, dto.remembered);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    const learnerId = user.learner?.id;
    if (!learnerId) throw new Error('Only learners have flashcard stats');
    return this.flashcardsService.getStats(learnerId);
  }
}
