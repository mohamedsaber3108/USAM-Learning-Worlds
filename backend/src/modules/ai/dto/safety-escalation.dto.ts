import { IsIn, IsOptional, IsString } from 'class-validator';

export class ResolveSafetyEscalationDto {
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
