import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CreativityController } from './creativity.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CreativityController],
})
export class CreativityModule {}
