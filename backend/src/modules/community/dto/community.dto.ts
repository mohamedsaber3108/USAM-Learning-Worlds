import { IsString, IsOptional, IsIn, IsNumber } from 'class-validator';

export class ReportContentDto {
  @IsIn(['PROJECT', 'COMMENT', 'MESSAGE', 'PROFILE'])
  entityType: string;

  @IsString()
  entityId: string;

  @IsIn(['INAPPROPRIATE', 'SPAM', 'HARASSMENT', 'COPYRIGHT', 'SAFETY', 'OTHER'])
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ResolveReportDto {
  @IsIn(['NO_ACTION', 'WARNING', 'REMOVE_CONTENT', 'SUSPEND_USER', 'BAN_USER'])
  action: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SearchCommunityDto {
  @IsString()
  query: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
