import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class SetTimeLimitsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(480)
  dailyMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2000)
  weeklyMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(23)
  bedtimeHour?: number;
}
