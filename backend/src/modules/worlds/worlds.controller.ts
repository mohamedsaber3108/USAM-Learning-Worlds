import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorldsService } from './worlds.service';

@Controller('worlds')
@UseGuards(JwtAuthGuard)
export class WorldsController {
  constructor(private worldsService: WorldsService) {}

  /**
   * List all active Worlds with real per-learner unlock status, reusing
   * the domain-engagement signal pattern from
   * character.service.ts's getUnlockedCharactersForLearner().
   */
  @Get()
  async listWorlds(@CurrentUser() user: any) {
    const learnerId = user?.learner?.id ?? null;
    return this.worldsService.getWorldsForLearner(learnerId);
  }

  @Get(':id')
  async getWorld(@Param('id') id: string) {
    const world = await this.worldsService.getWorld(id);
    if (!world) {
      throw new NotFoundException('World not found');
    }
    return world;
  }
}
