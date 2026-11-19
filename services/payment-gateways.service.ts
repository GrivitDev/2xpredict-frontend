import { apiRequest } from '../lib/axios';
import type { InitializePaymentArgs, PaymentReferenceArgs, QuotePaymentArgs, VerifyPaymentArgs } from '../types/endpoint-args/payment-gateways';
import type { InitializePaymentResponse, PaymentInitializationStatusResponse, PaymentQuoteResponse, VerifyPaymentResponse } from '../types/payment-gateways';

/** Client for the Payment Gateways NestJS module (Paystack currently). */
export const paymentGatewaysService = {
  quotePayment: (args: QuotePaymentArgs) =>
    apiRequest<PaymentQuoteResponse>({ method: 'POST', path: '/payment-gateways/quote', body: args.body }),
  initializePayment: (args: InitializePaymentArgs) =>
    apiRequest<InitializePaymentResponse>({ method: 'POST', path: '/payment-gateways/initialize', body: args.body }),
  getInitialization: (args: PaymentReferenceArgs) =>
    apiRequest<PaymentInitializationStatusResponse>({ method: 'GET', path: '/payment-gateways/paystack/initialization/:reference', pathParams: args.path }),
  verifyPayment: (args: VerifyPaymentArgs) =>
    apiRequest<VerifyPaymentResponse>({ method: 'GET', path: '/payment-gateways/paystack/verify', query: args.query }),
  reconcilePayment: (args: PaymentReferenceArgs) =>
    apiRequest<VerifyPaymentResponse>({ method: 'PATCH', path: '/payment-gateways/paystack/reconcile/:reference', pathParams: args.path }),
} as const;
