import type { Currency, PaymentStatus, PaymentType } from './payments';

export type PaymentGateway = 'paystack';

export interface InitializePaymentPayload {
  gateway: PaymentGateway;
  type: PaymentType;
  target: string;
  promoCode?: string;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode?: string;
  reference: string;
}

export interface VerifiedPaymentRecord {
  id: string;
  reference: string;
  status: PaymentStatus;
  type: PaymentType;
  target: string;
  amount: number;
  currency: Currency;
  gateway: PaymentGateway;
  processedAt: string | null;
}

export type VerifyPaymentStatus = 'approved' | 'failed' | 'processing' | 'pending';

export interface VerifyPaymentResponse {
  success: boolean;
  status: VerifyPaymentStatus;
  message: string;
  reference: string;
  transactionId: string | null;
  payment?: VerifiedPaymentRecord;
}

/** PromoPricingResult + the user's account currency, returned by POST /quote. */
export interface PaymentQuoteResponse {
  amount: number;
  baseAmount: number;
  discountAmount: number;
  promoId?: string;
  promoCode?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  pointsReward: number;
  currency: Currency;
}

export type PaymentInitializationStatus = 'initializing' | 'initialized' | 'unknown' | 'failed';

export interface PaymentInitializationStatusResponse {
  reference: string;
  paymentStatus: PaymentStatus;
  initializationStatus: PaymentInitializationStatus;
  authorizationUrl: string | null;
  initializedAt: string | null;
  message: string;
}
