/**
 * Legal compliance controller (audit T-P1-13).
 *
 * Guardian-facing endpoints for consent management + GDPR data-subject
 * rights. Every action is authorized against the caller's guardianship over
 * the target learner inside the service (verifyGuardian), so a guardian can
 * only ever act on their own children.
 */
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConsentPurpose } from '@prisma/client';
import { LegalComplianceService } from './legal-compliance.service';

interface CaptureConsentBody {
  learnerId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  policyVersion: string;
  jurisdiction?: string;
  verificationMethod?: string;
}

@Controller('legal')
@UseGuards(JwtAuthGuard)
export class LegalComplianceController {
  constructor(private legal: LegalComplianceService) {}

  private guardianId(user: any): string {
    const id = user?.guardian?.id;
    if (!id) throw new ForbiddenException('Only guardians can manage consent and data rights');
    return id;
  }

  @Post('consent')
  captureConsent(@CurrentUser() user: any, @Body() body: CaptureConsentBody, @Req() req: any) {
    return this.legal.captureConsent({
      guardianId: this.guardianId(user),
      learnerId: body.learnerId,
      purpose: body.purpose,
      granted: body.granted,
      policyVersion: body.policyVersion,
      jurisdiction: body.jurisdiction,
      verificationMethod: body.verificationMethod,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  }

  @Get('consent/:learnerId')
  getConsent(@CurrentUser() user: any, @Param('learnerId') learnerId: string) {
    return this.legal.getEffectiveConsent(this.guardianId(user), learnerId);
  }

  @Get('export/:learnerId')
  exportData(@CurrentUser() user: any, @Param('learnerId') learnerId: string) {
    return this.legal.exportLearnerData(this.guardianId(user), learnerId);
  }

  @Post('delete/:learnerId')
  deleteData(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
    @Body() body: { reason?: string },
  ) {
    return this.legal.deleteLearnerData(this.guardianId(user), learnerId, body?.reason);
  }
}
