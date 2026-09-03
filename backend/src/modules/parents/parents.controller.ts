import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SetTimeLimitsDto } from './dto/parents.dto';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  @Get('children')
  async getChildren(@CurrentUser() user: any) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can view children');
    }

    return this.parentsService.getChildren(guardianId);
  }

  @Get('family-summary')
  async getFamilySummary(@CurrentUser() user: any) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can view family summary');
    }

    return this.parentsService.getFamilySummary(guardianId);
  }

  @Get('children/:learnerId/dashboard')
  async getChildDashboard(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
  ) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can view child dashboard');
    }

    return this.parentsService.getChildDashboard(guardianId, learnerId);
  }

  @Get('children/:learnerId/progress')
  async getChildProgress(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
  ) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can view child progress');
    }

    return this.parentsService.getChildProgress(guardianId, learnerId);
  }

  @Get('children/:learnerId/activity')
  async getChildActivity(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
    @Query('days') days?: string,
  ) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can view child activity');
    }

    const daysNum = days ? parseInt(days, 10) : 7;
    return this.parentsService.getChildActivity(guardianId, learnerId, daysNum);
  }

  /**
   * Metacognition Engine (guardian view): a child's recent post-mission
   * reflections (prompt + 1-5 self-rating + optional note), so a guardian
   * can see how their kid says they're feeling about missions, not just
   * score/XP numbers. Was previously write-only — learners could submit
   * reflections but nothing surfaced them to guardians.
   */
  @Get('children/:learnerId/reflections')
  async getChildReflections(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
    @Query('limit') limit?: string,
  ) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can view child reflections');
    }

    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.parentsService.getChildReflections(guardianId, learnerId, limitNum);
  }

  @Post('children/:learnerId/time-limits')
  async setTimeLimits(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
    @Body() dto: SetTimeLimitsDto,
  ) {
    const guardianId = user.guardian?.id;
    if (!guardianId) {
      throw new Error('Only guardians can set time limits');
    }

    return this.parentsService.setTimeLimits(guardianId, learnerId, dto);
  }
}
