import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementsService } from './entitlements.service';
import { EntitlementsController } from './entitlements.controller';
import { ManualPaymentProvider } from './payment/manual-payment.provider';
import { PAYMENT_PROVIDER } from './payment/payment-provider.interface';

/**
 * Entitlements module (audit #11). The PAYMENT_PROVIDER token is bound to the
 * ManualPaymentProvider (no gateway). To wire a real gateway later, implement
 * PaymentProvider and swap the useClass here — nothing else changes.
 */
@Module({
  imports: [AuthModule],
  controllers: [EntitlementsController],
  providers: [
    EntitlementsService,
    ManualPaymentProvider,
    { provide: PAYMENT_PROVIDER, useExisting: ManualPaymentProvider },
  ],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
