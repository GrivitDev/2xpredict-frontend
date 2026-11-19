import type { InitializePaymentPayload, PaymentQuoteResponse } from '../payment-gateways';
import type { PaymentType } from '../payments';

export interface QuotePaymentPayload {
  type: PaymentType;
  target: string;
  promoCode?: string;
}
export interface QuotePaymentArgs {
  body: QuotePaymentPayload;
}
export interface InitializePaymentArgs {
  body: InitializePaymentPayload;
}
export interface PaymentReferenceArgs {
  path: { reference: string };
}
export interface VerifyPaymentQuery {
  reference: string;
}
export interface VerifyPaymentArgs {
  query: VerifyPaymentQuery;
}

export type { PaymentQuoteResponse };
