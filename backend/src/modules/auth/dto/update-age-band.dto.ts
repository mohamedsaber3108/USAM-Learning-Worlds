import { IsEnum } from 'class-validator';
import { AgeBand } from '@prisma/client';

// Used by PATCH /auth/me/age-band — persists the age-band a learner
// selects during the first-time onboarding flow.
export class UpdateAgeBandDto {
  @IsEnum(AgeBand)
  ageBand: AgeBand;
}
