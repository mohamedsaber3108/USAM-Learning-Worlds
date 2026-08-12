import { IsString, IsOptional, IsNumber, IsIn, IsArray } from 'class-validator';

export class GenerateFeedbackDto {
  @IsString()
  work: string;

  @IsString()
  rubric: string;

  @IsString()
  @IsOptional()
  context?: string;
}

export class GenerateHintDto {
  @IsString()
  question: string;

  @IsString()
  learnerAttempt: string;

  @IsIn(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';
}

export class ExplainConceptDto {
  @IsString()
  concept: string;

  @IsNumber()
  learnerAge: number;

  @IsString()
  @IsOptional()
  context?: string;
}

export class AnalyzeResponseDto {
  @IsString()
  question: string;

  @IsString()
  learnerResponse: string;

  @IsArray()
  @IsString({ each: true })
  keyPoints: string[];
}

export class ModerateContentDto {
  @IsString()
  content: string;

  @IsIn(['TEXT', 'IMAGE_URL', 'CODE'])
  contentType: 'TEXT' | 'IMAGE_URL' | 'CODE';

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  entityId?: string;
}
