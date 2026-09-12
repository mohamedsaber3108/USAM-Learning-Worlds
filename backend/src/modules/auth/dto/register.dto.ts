import { IsEmail, IsString, MinLength, IsIn, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { AgeBand } from '@prisma/client';

/**
 * Roles a member of the public is allowed to self-register as.
 * SECURITY (audit T-P0-1 / GAP-S1): the public /auth/register endpoint must
 * NEVER accept ADMIN or MODERATOR. Those privileged roles are provisioned
 * only through an internal/admin path. `@IsIn` here is the first line of
 * defense (request validation); AuthService.register enforces the same
 * allowlist server-side as defense-in-depth in case this DTO is bypassed.
 */
export const PUBLIC_REGISTRATION_ROLES = ['LEARNER', 'GUARDIAN'] as const;
export type PublicRegistrationRole = (typeof PUBLIC_REGISTRATION_ROLES)[number];

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(PUBLIC_REGISTRATION_ROLES, {
    message: 'role must be one of: LEARNER, GUARDIAN',
  })
  role: PublicRegistrationRole;

  // Learner-specific fields
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(AgeBand)
  ageBand?: AgeBand;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // Guardian-specific fields
  @IsOptional()
  @IsString()
  guardianFirstName?: string;

  @IsOptional()
  @IsString()
  guardianLastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
