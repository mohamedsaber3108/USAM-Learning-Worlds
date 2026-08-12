import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GetRecommendationsDto {
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}

export class GetNextActivityDto {
  @IsString()
  competencyId: string;
}

export class GetLearningPathDto {
  @IsString()
  skillId: string;
}
