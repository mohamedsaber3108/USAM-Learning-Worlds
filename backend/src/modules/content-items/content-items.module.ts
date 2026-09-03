import { Module } from '@nestjs/common';
import { ContentItemsService } from './content-items.service';
import { ContentItemsController } from './content-items.controller';

@Module({
  controllers: [ContentItemsController],
  providers: [ContentItemsService],
  exports: [ContentItemsService],
})
export class ContentItemsModule {}
