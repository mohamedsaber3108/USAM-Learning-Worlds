import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AssessmentQualityService } from './assessment-quality.service';

@Controller('admin/assessment-quality')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
export class AdminAssessmentQualityController {
  constructor(private assessmentQualityService: AssessmentQualityService) {}

  @Post('scan')
  async scan() {
    return this.assessmentQualityService.scanAndPersist();
  }

  @Get('flags')
  async listFlags() {
    return this.assessmentQualityService.listOpenFlags();
  }
}
