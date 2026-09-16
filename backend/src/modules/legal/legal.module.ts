import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { LegalComplianceService } from './legal-compliance.service';
import { LegalComplianceController } from './legal-compliance.controller';

/**
 * Legal/privacy compliance module (audit T-P1-13). Uses AuditModule for the
 * audit trail on consent/export/deletion actions and AuthModule for JWT
 * guarding. PrismaService is global.
 */
@Module({
  imports: [AuditModule, AuthModule],
  controllers: [LegalComplianceController],
  providers: [LegalComplianceService],
  exports: [LegalComplianceService],
})
export class LegalModule {}
