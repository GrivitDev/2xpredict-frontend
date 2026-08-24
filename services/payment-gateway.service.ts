import api from '@/lib/axios';

// =====================================================
// TYPES
// =====================================================

export type PaymentGateway = 'paystack' | 'opay';

export type PaymentCurrency = 'NGN' | 'USD';

export type PaymentType =
  | 'subscription'
  | 'prediction'
  | 'vip_upgrade';

// =====================================================
// INITIALIZE PAYMENT
// =====================================================

export interface InitializePaymentPayload {
  gateway: PaymentGateway;

  type: PaymentType;

  /**
   * Currency being used for the payment.
   *
   * NGN = Nigerian Naira
   * USD = United States Dollar
   */
  currency: PaymentCurrency;

  /**
   * Identifies what the payment is for.
   *
   * Examples:
   * - subscription plan ID
   * - prediction ID
   * - VIP upgrade ID
   */
  target: string;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;

  accessCode?: string;

  reference: string;
}

// =====================================================
// VERIFY PAYMENT
// =====================================================

export interface VerifyPaymentResponse {
  success?: boolean;

  reference?: string;

  transactionId?: string;

  message?: string;

  status?: string;

  [key: string]: any;
}

// =====================================================
// PAYMENT GATEWAY SERVICE
// =====================================================

const paymentGatewayService = {
  /**
   * Initialize a payment with Paystack or OPay.
   *
   * The backend creates the pending payment record,
   * initializes the selected gateway, and returns the
   * gateway authorization URL.
   */
  async initializePayment(
    payload: InitializePaymentPayload,
  ): Promise<InitializePaymentResponse> {
    const response =
      await api.post<InitializePaymentResponse>(
        '/payment-gateways/initialize',
        payload,
      );

    return response.data;
  },

  /**
   * Verify a payment after the user returns from
   * Paystack or OPay.
   *
   * The backend verifies the transaction with the
   * selected payment gateway.
   */
  async verifyPayment(
    gateway: PaymentGateway,
    reference: string,
  ): Promise<VerifyPaymentResponse> {
    const response =
      await api.get<VerifyPaymentResponse>(
        `/payment-gateways/${gateway}/verify`,
        {
          params: {
            reference,
          },
        },
      );

    return response.data;
  },
};

export default paymentGatewayService;