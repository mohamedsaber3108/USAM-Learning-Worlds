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

  /**
   * Real curriculum Domain.id values this project explicitly draws on.
   * Cross-Domain/Interdisciplinary Project Engine: a project with 2+
   * distinct domainIds is flagged isCrossDomain server-side (see
   * ProjectsService.createProject) -- the author declares which real
   * domains a project spans, distinct from the untagged, domain-agnostic
   * default every project had before this field existed.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  domainIds?: string[];
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  domainIds?: string[];
}