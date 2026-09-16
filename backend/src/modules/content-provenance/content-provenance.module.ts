import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentProvenanceService } from './content-provenance.service';
import { ContentProvenanceController } from './content-provenance.controller';

/**
 * Content provenance module (audit T-P1-7). PrismaService is global; AuthModule
 * supplies the JWT/Roles guards used by the admin controller.
 */
@Module({
  imports: [AuthModule],
  controllers: [ContentProvenanceController],
  providers: [ContentProvenanceService],
  exports: [ContentProvenanceService],
})
export class ContentProvenanceModule {}
