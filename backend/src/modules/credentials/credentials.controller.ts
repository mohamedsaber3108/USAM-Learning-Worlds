/**
 * Credentials Controller (audit T-P1-6)
 *
 * Surfaces earned credentials to learners/parents and provides a public
 * verification endpoint (the whole point of a *verifiable* credential is that
 * a third party can fetch and check it).
 */

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CredentialsService } from './credentials.service';

@Controller('credentials')
export class CredentialsController {
  constructor(private credentials: CredentialsService) {}

  /**
   * List the authenticated learner's earned credentials.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async myCredentials(@CurrentUser() user: any) {
    const learnerId = user?.learner?.id;
    if (!learnerId) return [];
    return this.credentials.listForLearner(learnerId);
  }

  /**
   * Public verification: fetch the full Open Badges 3.0 document by its
   * stable UID. No auth — a credential is meant to be independently
   * verifiable. Returns only the credential JSON + revocation status, no
   * other learner data.
   */
  @Get(':uid')
  async verify(@Param('uid') uid: string) {
    return this.credentials.getByUid(uid);
  }
}
