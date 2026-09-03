import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * CMS/Content Studio + Curriculum/Character/Mission/Activity Authoring
 * Engine — v1, Mission content type only (see
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md CMS row).
 *
 * Thin admin-only controller: no business logic of its own, delegates
 * every operation straight to MissionsService's admin* /create/update/
 * delete methods, which the existing learner-facing MissionsController
 * (GET /missions, GET /missions/:id) already reads from the exact same
 * Mission Prisma model. Content authored here is immediately visible to
 * learners through the pre-existing, unmodified read paths.
 *
 * Guarded by the real ADMIN role (backend/prisma/schema.prisma Role enum
 * already includes ADMIN — no new role/allowlist hack needed) via the
 * existing, previously-unused RolesGuard + @Roles() decorator pair.
 */
@Controller('admin/missions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminMissionsController {
  constructor(private missionsService: MissionsService) {}

  @Get()
  async list() {
    return this.missionsService.adminListMissions();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.missionsService.adminGetMission(id);
  }

  @Post()
  async create(
    @Body()
    dto: {
      title: string;
      description: string;
      type: string;
      estimatedMinutes?: number;
      order?: number;
      isActive?: boolean;
      worldId?: string;
    },
  ) {
    return this.missionsService.createMission(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      description?: string;
      type?: string;
      estimatedMinutes?: number;
      order?: number;
      isActive?: boolean;
      worldId?: string;
    },
  ) {
    return this.missionsService.updateMission(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.missionsService.deleteMission(id);
  }
}
