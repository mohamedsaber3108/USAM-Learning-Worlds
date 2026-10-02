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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
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

  /**
   * FIX (2026-10-02): this was previously gated by `!user.educator &&
   * !user.parent` — properties that never exist on the authenticated user
   * object (the JWT payload only ever carries `learner`/`guardian`; there is
   * no "educator" or "parent" role or relation anywhere in the schema). That
   * made this endpoint unconditionally 403 for every caller, including
   * ADMIN, permanently breaking the moderator Community Moderation page.
   * Replaced with the same declarative RolesGuard + @Roles() pattern used by
   * every other staff-only controller (safety-escalations, admin-*).
   */
  @Get('moderation/quarantined')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async getQuarantinedContent(@Query('status') status?: string) {
    return this.communityService.getQuarantinedContent(status);
  }

  @Post('moderation/review/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async reviewContent(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { decision: 'APPROVED' | 'REJECTED'; notes?: string },
  ) {
    return this.communityService.reviewContent(id, user.id, dto);
  }
}
