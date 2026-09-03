import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DifficultyCalibrationService } from './difficulty-calibration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Difficulty Calibration Engine v1 — admin-only endpoints.
 *
 * POST /api/admin/difficulty-calibration/scan  — runs the scan fresh
 *   over live ActivityAttempt data and persists every newly-found
 *   authored-vs-empirical mismatch as a DifficultyCalibrationFlag
 *   (idempotent: re-running does not duplicate already-open flags).
 * GET  /api/admin/difficulty-calibration/flags — lists currently open
 *   (unresolved) flags.
 *
 * Guarded the same way Content QA / Assessment Quality controllers are:
 * JwtAuthGuard + RolesGuard + @Roles(Role.ADMIN).
 */
@Controller('admin/difficulty-calibration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DifficultyCalibrationController {
  constructor(private difficultyCalibration: DifficultyCalibrationService) {}

  @Post('scan')
  async scan() {
    return this.difficultyCalibration.scanAndPersist();
  }

  @Get('flags')
  async listFlags(@Query('take') take?: string) {
    return this.difficultyCalibration.listOpenFlags(take ? parseInt(take, 10) : undefined);
  }
}
