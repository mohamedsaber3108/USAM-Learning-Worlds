import { Module } from '@nestjs/common';
import { ContentQaService } from './content-qa.service';
import { ContentQaController } from './content-qa.controller';

@Module({
  controllers: [ContentQaController],
  providers: [ContentQaService],
  exports: [ContentQaService],
})
export class ContentQaModule {}
