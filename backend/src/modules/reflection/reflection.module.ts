import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ReflectionController } from './reflection.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReflectionController],
})
export class ReflectionModule {}
