/**
 * Manual payment provider (audit #11).
 *
 * The default, no-gateway implementation of PaymentProvider. It represents
 * free / comped / admin-granted subscriptions: there is nothing to charge, so
 * a checkout "activates" immediately and cancellation is a no-op on the
 * provider side (the subscription state is managed entirely in our DB by
 * EntitlementsService). This lets the whole entitlement flow run in
 * production for free tiers while a real gateway is added later.
 */
import { Injectable, Logger } from '@nestjs/common';
import {
  CheckoutSessionRequest,
  CheckoutSessionResult,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  readonly id = 'manual';
  private readonly logger = new Logger(ManualPaymentProvider.name);

  async createCheckout(req: CheckoutSessionRequest): Promise<CheckoutSessionResult> {
    this.logger.log(
      `Manual checkout for user=${req.ownerUserId} plan=${req.planCode} (no charge, activated immediately)`,
    );
    return {
      provider: this.id,
      checkoutUrl: null,
      providerRef: null,
      activated: true,
    };
  }

  async cancel(providerRef: string): Promise<void> {
    // Nothing to cancel on a manual (no-gateway) subscription.
    this.logger.log(`Manual cancel for ref=${providerRef} (no-op)`);
  }
}
