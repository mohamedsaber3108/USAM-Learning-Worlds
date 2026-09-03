import { Module } from '@nestjs/common';
import { DifficultyCalibrationService } from './difficulty-calibration.service';
import { DifficultyCalibrationController } from './difficulty-calibration.controller';

@Module({
  controllers: [DifficultyCalibrationController],
  providers: [DifficultyCalibrationService],
  exports: [DifficultyCalibrationService],
})
export class DifficultyCalibrationModule {}
