/**
 * @deprecated Billing is not a backend module. Import the owning service:
 * paymentGatewaysService, paymentsService, planConfigService, or subscriptionsService.
 */
export { paymentGatewaysService } from './payment-gateways.service';
export { paymentsService } from './payments.service';
export { planConfigService } from './plan-config.service';
export { subscriptionsService } from './subscriptions.service';



import paymentGatewayService from './payment-gateway.service';
import { paymentsService } from './payments.service';
import { planConfigService } from './plan-config.service';
import { subscriptionsService } from './subscriptions.service';
import type { CreateManualPaymentPayload } from '../types/payments';
import type { InitializePaymentPayload } from '../types/payment-gateways';

/**
 * Compatibility facade for older billing hooks. Each operation delegates to
 * the NestJS module that owns the endpoint; there is no backend BillingModule.
 */
export const billingService = {
  getPlanConfig: planConfigService.get,
  updatePlanConfig: (payload: Parameters<typeof planConfigService.update>[0]['body']) =>
    planConfigService.update({ body: payload }),
  getMyPayments: paymentsService.getMyPayments,
  getAdminPayments: paymentsService.all,
  getPendingPayments: paymentsService.pending,
  createManualPayment: (payload: CreateManualPaymentPayload) => paymentsService.create({ body: payload }),
  approvePayment: (id: string) => paymentsService.approve({ path: { id } }),
  rejectPayment: (id: string) => paymentsService.reject({ path: { id } }),
  initializePaystackPayment: (payload: InitializePaymentPayload) => paymentGatewayService.initializePayment(payload),
  verifyPaystackPayment: (reference: string) => paymentGatewayService.verifyPayment('paystack', reference),
  getMySubscription: subscriptionsService.getMySubscription,
  getSubscriptionStatus: subscriptionsService.getStatus,
  getUpgradePrice: subscriptionsService.getUpgradePrice,
} as const;
