import { paymentGatewaysService } from './payment-gateways.service';
import type {
  InitializePaymentPayload as BackendInitializePaymentPayload,
  InitializePaymentResponse,
  PaymentGateway as BackendPaymentGateway,
  VerifyPaymentResponse,
} from '@/types/payment-gateways';
import type { Currency, PaymentType } from '@/types/payments';

/** Compatibility aliases for components that still import these names here. */
export type PaymentGateway = BackendPaymentGateway;
export type PaymentCurrency = Currency;
export type { PaymentType, InitializePaymentResponse, VerifyPaymentResponse };
export type InitializePaymentPayload = BackendInitializePaymentPayload;

/**
 * Backwards-compatible client facade. Payload and routes are delegated to the
 * canonical Payment Gateways service and mirror the NestJS controller DTO.
 */
const paymentGatewayService = {
  initializePayment(payload: InitializePaymentPayload): Promise<InitializePaymentResponse> {
    return paymentGatewaysService.initializePayment({ body: payload });
  },

  verifyPayment(
    gateway: PaymentGateway,
    reference: string,
  ): Promise<VerifyPaymentResponse> {
    if (gateway !== 'paystack') {
      throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
    return paymentGatewaysService.verifyPayment({ query: { reference } });
  },
};

export default paymentGatewayService;
