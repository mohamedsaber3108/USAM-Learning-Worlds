import { Module } from '@nestjs/common';
import { MisconceptionService } from './misconception.service';
import { AdminMisconceptionsController } from './admin-misconceptions.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminMisconceptionsController],
  providers: [MisconceptionService],
  exports: [MisconceptionService],
})
export class MisconceptionModule {}
