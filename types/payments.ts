import type { IdRecord } from './common';

export type Currency = 'NGN' | 'USD';
export type PaymentType = 'subscription' | 'vip_upgrade' | 'premium_upgrade';
export type PaymentStatus = 'pending' | 'processing' | 'approved' | 'rejected';
export type PaymentGateway = 'manual' | 'paystack';
export type PaymentGatewayInitializationStatus =
  | 'not_applicable'
  | 'initializing'
  | 'initialized'
  | 'unknown'
  | 'failed';
export type PaymentApprovalSource = 'manual' | 'paystack';

/** Exact body accepted by POST /payments. Currency is derived by the backend from the user's account. */
export interface CreateManualPaymentPayload {
  type: PaymentType;
  target: string;
  transferReference?: string;
  proofImageUrl?: string;
  proofPublicId?: string;
  proofMessage?: string;
  promoCode?: string;
}

export interface Payment extends IdRecord {
  userId: string;
  email: string;
  amount: number;
  baseAmount?: number;
  discountAmount: number;
  promoCode?: string;
  promoId?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  pointsReward: number;
  currency: Currency;
  reference: string;
  status: PaymentStatus;
  type: PaymentType;
  target: string;
  gateway?: PaymentGateway;
  gatewayAmount?: number | null;
  gatewayCurrency?: 'NGN';
  exchangeRate?: number;
  gatewayTransactionId?: string;
  gatewayInitializationStatus: PaymentGatewayInitializationStatus;
  gatewayAuthorizationUrl?: string | null;
  gatewayInitializationAttemptedAt?: string | null;
  gatewayInitializedAt?: string | null;
  gatewayInitializationLastError?: string | null;
  transferReference?: string;
  proofImageUrl?: string;
  proofPublicId?: string;
  proofMessage?: string;
  adminNote?: string;
  processingAttempts: number;
  processingLeaseExpiresAt?: string | null;
  processingLastError?: string | null;
  approvalSource?: PaymentApprovalSource;
  processedAt?: string | null;
  processedBy?: string | null;
}

export interface CreatePaymentResponse {
  message: string;
  reference: string;
  payment: Payment;
}

export interface PaymentDecisionResponse {
  message: string;
  payment: Payment;
}
