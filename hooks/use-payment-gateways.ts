'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { paymentGatewaysService } from '../services/payment-gateways.service';
import type { InitializePaymentArgs, PaymentReferenceArgs, QuotePaymentArgs, VerifyPaymentArgs } from '../types/endpoint-args/payment-gateways';
import type { InitializePaymentResponse, PaymentInitializationStatusResponse, PaymentQuoteResponse, VerifyPaymentResponse } from '../types/payment-gateways';
import { useAuth } from '../providers/auth-provider';
import { paymentsQueryKeys } from './use-payments';
import { subscriptionsQueryKeys } from './use-subscriptions';

export const paymentGatewayQueryKeys = {
  all: ['payment-gateways'] as const,
  initialization: (reference: string, principal: string) => ['payment-gateways', 'initialization', principal, reference] as const,
  verification: (reference: string, principal: string) => ['payment-gateways', 'verification', principal, reference] as const,
};

export function useQuotePaymentMutation(options?: ApiMutationHookOptions<PaymentQuoteResponse, QuotePaymentArgs>) {
  return useMutation({ mutationFn: (args: QuotePaymentArgs) => paymentGatewaysService.quotePayment(args), ...options });
}

/** A newly initialized gateway payment must immediately appear in the user's payment history. */
export function useInitializePaymentMutation(options?: ApiMutationHookOptions<InitializePaymentResponse, InitializePaymentArgs>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (args: InitializePaymentArgs) => paymentGatewaysService.initializePayment(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: paymentsQueryKeys.all }),
        client.invalidateQueries({ queryKey: paymentGatewayQueryKeys.all }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function usePaymentPrincipal() {
  const { user, token, loading } = useAuth();
  return {
    loading,
    authenticated: Boolean(user || token),
    principal: String(user?.userId ?? (token ? 'authenticated' : 'anonymous')),
  };
}

export function usePaymentInitializationQuery(args: PaymentReferenceArgs, options?: ApiQueryHookOptions<PaymentInitializationStatusResponse>) {
  const { loading, authenticated, principal } = usePaymentPrincipal();
  return useQuery({
    queryKey: paymentGatewayQueryKeys.initialization(args.path.reference, principal),
    queryFn: () => paymentGatewaysService.getInitialization(args),
    staleTime: 5_000,
    ...options,
    enabled: !loading && authenticated && Boolean(args.path.reference) && options?.enabled !== false,
  });
}

export function useVerifyPaymentQuery(args: VerifyPaymentArgs, options?: ApiQueryHookOptions<VerifyPaymentResponse>) {
  const { loading, authenticated, principal } = usePaymentPrincipal();
  return useQuery({
    queryKey: paymentGatewayQueryKeys.verification(args.query.reference, principal),
    queryFn: () => paymentGatewaysService.verifyPayment(args),
    retry: false,
    ...options,
    enabled: !loading && authenticated && Boolean(args.query.reference) && options?.enabled !== false,
  });
}

/** Imperative verification is used by the Paystack return page after parsing its reference. */
export function useVerifyPaymentMutation(options?: ApiMutationHookOptions<VerifyPaymentResponse, VerifyPaymentArgs>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (args: VerifyPaymentArgs) => paymentGatewaysService.verifyPayment(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: paymentsQueryKeys.all }),
        client.invalidateQueries({ queryKey: paymentGatewayQueryKeys.all }),
        client.invalidateQueries({ queryKey: subscriptionsQueryKeys.all }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useReconcilePaymentMutation(options?: ApiMutationHookOptions<VerifyPaymentResponse, PaymentReferenceArgs>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (args: PaymentReferenceArgs) => paymentGatewaysService.reconcilePayment(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: paymentsQueryKeys.all }),
        client.invalidateQueries({ queryKey: paymentGatewayQueryKeys.all }),
        client.invalidateQueries({ queryKey: subscriptionsQueryKeys.all }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
