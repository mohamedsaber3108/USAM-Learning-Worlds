import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsIn(['PRIVATE', 'GUARDIANS_ONLY', 'PUBLIC'])
  visibility: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  competencyId?: string;

  @IsString()
  @IsOptional()
  objectiveId?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['DRAFT', 'PLANNING', 'BUILDING', 'REVIEW', 'REVISION', 'COMPLETED', 'SHOWCASED'])
  @IsOptional()
  state?: string;

  @IsIn(['PRIVATE', 'GUARDIANS_ONLY', 'PUBLIC'])
  @IsOptional()
  visibility?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  competencyId?: string;

  @IsString()
  @IsOptional()
  objectiveId?: string;
}
