import { Module } from '@nestjs/common';
import { InterventionService } from './intervention.service';
import { AdminInterventionsController } from './admin-interventions.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [AdminInterventionsController],
  providers: [InterventionService],
  exports: [InterventionService],
})
export class InterventionModule {}
