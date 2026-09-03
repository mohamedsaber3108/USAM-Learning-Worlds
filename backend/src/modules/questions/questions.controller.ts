import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionType } from '@prisma/client';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('templates')
  async listTemplates(
    @Query('objectiveId') objectiveId?: string,
    @Query('type') type?: QuestionType,
  ) {
    return this.questionsService.listTemplates(objectiveId, type);
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.questionsService.getTemplate(id);
  }

  @Post('generate')
  async generateActivity(
    @Body()
    dto: {
      templateId: string;
      distractorCount?: number;
      missionId?: string;
      order?: number;
    },
  ) {
    return this.questionsService.generateActivity(dto.templateId, {
      distractorCount: dto.distractorCount,
      missionId: dto.missionId,
      order: dto.order,
    });
  }
}
