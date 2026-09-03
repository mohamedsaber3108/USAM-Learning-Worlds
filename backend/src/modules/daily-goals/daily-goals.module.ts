import { Module } from '@nestjs/common';
import { DailyGoalsController } from './daily-goals.controller';
import { DailyGoalsService } from './daily-goals.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DailyGoalsController],
  providers: [DailyGoalsService],
  exports: [DailyGoalsService],
})
export class DailyGoalsModule {}
