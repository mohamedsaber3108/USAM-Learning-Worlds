import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ResolveSafetyEscalationDto {
  @IsIn(['RESOLVED_INTERNALLY', 'REFERRED_TO_GUARDIAN', 'REFERRED_TO_HUMAN_SUPPORT', 'FALSE_POSITIVE'])
  resolutionType: 'RESOLVED_INTERNALLY' | 'REFERRED_TO_GUARDIAN' | 'REFERRED_TO_HUMAN_SUPPORT' | 'FALSE_POSITIVE';

  @IsString()
  @IsNotEmpty()
  resolutionNote: string;

  @IsString()
  @IsOptional()
  resolvedBy?: string;
}

export class AssignSafetyEscalationDto {
  @IsString()
  assignedTo: string;
}

export class ListSafetyEscalationsQueryDto {
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}
