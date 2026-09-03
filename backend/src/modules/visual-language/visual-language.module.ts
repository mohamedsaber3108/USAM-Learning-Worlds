import { Module } from '@nestjs/common';
import { VisualLanguageService } from './visual-language.service';
import { VisualLanguageController } from './visual-language.controller';

@Module({
  providers: [VisualLanguageService],
  controllers: [VisualLanguageController],
  exports: [VisualLanguageService],
})
export class VisualLanguageModule {}
