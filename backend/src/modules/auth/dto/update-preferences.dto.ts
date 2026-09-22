import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Used by PATCH /auth/me/preferences — persists learner onboarding
 * preferences (interests, learning-style, goals) onto Learner.preferences
 * (Json). Fields are optional so separate onboarding steps can each PATCH
 * their slice; the service merges with existing preferences.
 */
export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  learningStyle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  // Escape hatch for additional onboarding preference keys without needing a
  // new DTO field per step. Validated as an object; merged server-side.
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}
