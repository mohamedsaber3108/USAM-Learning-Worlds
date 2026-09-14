import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';

/**
 * Credentials module (audit T-P1-6). PrismaService is provided globally
 * (DatabaseModule is @Global), so this module only needs its own service +
 * controller. Exported so MasteryModule can issue credentials on mastery
 * gain without a circular dependency.
 */
@Module({
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
