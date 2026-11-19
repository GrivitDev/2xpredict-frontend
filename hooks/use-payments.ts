'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { paymentsService } from '../services/payments.service';
import type { ApproveArgs, CreateArgs, RejectArgs } from '../types/endpoint-args/payments';
import type { CreatePaymentResponse, Payment, PaymentDecisionResponse } from '../types/payments';
import { subscriptionsQueryKeys } from './use-subscriptions';
import { useAuth } from '../providers/auth-provider';

export const paymentsQueryKeys = {
  all: ['payments'] as const,
  mine: (principal: string) => ['payments', 'mine', principal] as const,
  pending: () => ['payments', 'admin', 'pending'] as const,
  admin: () => ['payments', 'admin', 'all'] as const,
};

function useInvalidatePayments() {
  const client = useQueryClient();
  return async (includeSubscriptionState = false) => {
    const invalidations = [client.invalidateQueries({ queryKey: paymentsQueryKeys.all })];
    if (includeSubscriptionState) {
      invalidations.push(client.invalidateQueries({ queryKey: subscriptionsQueryKeys.all }));
    }
    await Promise.all(invalidations);
  };
}

export function useCreatePaymentMutation(options?: ApiMutationHookOptions<CreatePaymentResponse, CreateArgs>) {
  const invalidate = useInvalidatePayments();
  return useMutation({
    mutationFn: (args: CreateArgs) => paymentsService.create(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useGetMyPaymentsQuery(options?: ApiQueryHookOptions<Payment[]>) {
  const { user, token, loading } = useAuth();
  const principal = String(user?.userId ?? (token ? 'authenticated' : 'anonymous'));
  return useQuery({
    queryKey: paymentsQueryKeys.mine(principal),
    queryFn: paymentsService.getMyPayments,
    staleTime: 10_000,
    refetchInterval: 30_000,
    ...options,
    enabled: !loading && Boolean(user || token) && options?.enabled !== false,
  });
}

export function useApprovePaymentMutation(options?: ApiMutationHookOptions<PaymentDecisionResponse, ApproveArgs>) {
  const invalidate = useInvalidatePayments();
  return useMutation({
    mutationFn: (args: ApproveArgs) => paymentsService.approve(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate(true);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useRejectPaymentMutation(options?: ApiMutationHookOptions<Payment, RejectArgs>) {
  const invalidate = useInvalidatePayments();
  return useMutation({
    mutationFn: (args: RejectArgs) => paymentsService.reject(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function usePendingPaymentsQuery(options?: ApiQueryHookOptions<Payment[]>) {
  return useQuery({ queryKey: paymentsQueryKeys.pending(), queryFn: paymentsService.pending, refetchInterval: 30_000, ...options });
}

export function useAllPaymentsQuery(options?: ApiQueryHookOptions<Payment[]>) {
  return useQuery({ queryKey: paymentsQueryKeys.admin(), queryFn: paymentsService.all, ...options });
}

// Compatibility names retained for remaining page imports.
export const useCreateMutation = useCreatePaymentMutation;
export const useApproveMutation = useApprovePaymentMutation;
export const useRejectMutation = useRejectPaymentMutation;
export const usePendingQuery = usePendingPaymentsQuery;
export const useAllQuery = useAllPaymentsQuery;
