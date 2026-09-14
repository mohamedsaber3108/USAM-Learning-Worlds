import { Module } from '@nestjs/common';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { FsrsService } from './fsrs.service';

@Module({
  controllers: [FlashcardsController],
  providers: [FlashcardsService, FsrsService],
  exports: [FlashcardsService, FsrsService],
})
export class FlashcardsModule {}
