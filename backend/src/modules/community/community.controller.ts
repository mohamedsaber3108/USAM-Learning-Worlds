import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportContentDto } from './dto/community.dto';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get('feed')
  async getCommunityFeed(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getCommunityFeed({
      type,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('trending')
  async getTrendingProjects(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.communityService.getTrendingProjects(limitNum);
  }

  @Get('search')
  async searchCommunity(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      return { results: [], total: 0 };
    }

    return this.communityService.searchCommunity(query, {
      type,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  async getCommunityStats() {
    return this.communityService.getCommunityStats();
  }

  @Post('report')
  async reportContent(
    @CurrentUser() user: any,
    @Body() dto: ReportContentDto,
  ) {
    return this.communityService.reportContent(user.id, dto);
  }

  @Get('moderation/quarantined')
  async getQuarantinedContent(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    if (!user.educator && !user.parent) {
      throw new Error('Only educators and parents can view quarantined content');
    }

    return this.communityService.getQuarantinedContent(status);
  }

  @Post('moderation/review/:id')
  async reviewContent(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { decision: 'APPROVED' | 'REJECTED'; notes?: string },
  ) {
    if (!user.educator && !user.parent) {
      throw new Error('Only educators and parents can review content');
    }

    return this.communityService.reviewContent(id, user.id, dto);
  }
}
