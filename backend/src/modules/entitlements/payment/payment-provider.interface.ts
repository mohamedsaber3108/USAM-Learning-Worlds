/**
 * Payment provider abstraction (audit #11).
 *
 * NO real payment gateway is wired. This interface defines the seam a real
 * provider (Stripe, Paddle, etc.) will implement later. Today the only
 * implementation is ManualPaymentProvider (below), which represents comped /
 * admin-granted / free subscriptions with no external charge — so the entire
 * subscription→entitlement flow works end-to-end now and a gateway can be
 * added without touching EntitlementsService.
 */

export interface CheckoutSessionRequest {
  ownerUserId: string;
  planCode: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResult {
  /** Provider id, e.g. 'manual', 'stripe'. */
  provider: string;
  /** For real providers, the hosted-checkout URL to redirect to. Null for
   * manual (nothing to pay). */
  checkoutUrl: string | null;
  /** Provider-side reference/session id, if any. */
  providerRef: string | null;
  /** Whether the subscription is already active (true for manual/free). */
  activated: boolean;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentProvider {
  readonly id: string;
  /**
   * Begin a checkout. A real provider returns a checkoutUrl to redirect to
   * and activates the subscription later via webhook. The manual provider
   * activates immediately with no charge.
   */
  createCheckout(req: CheckoutSessionRequest): Promise<CheckoutSessionResult>;
  /** Cancel/stop billing for a provider subscription reference. */
  cancel(providerRef: string): Promise<void>;
}
