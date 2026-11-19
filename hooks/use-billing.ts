'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingService } from '@/services/billing.service';
import type { CreateManualPaymentPayload, InitializePaymentPayload, PaymentType, SubscriptionPlan } from '@/types/billing';

export const billingQueryKeys = {
  all: ['billing'] as const,
  plans: () => [...billingQueryKeys.all, 'plan-config'] as const,
  myPayments: () => [...billingQueryKeys.all, 'my-payments'] as const,
  adminPayments: () => [...billingQueryKeys.all, 'admin-payments'] as const,
  pendingPayments: () => [...billingQueryKeys.all, 'pending-payments'] as const,
  mySubscription: () => [...billingQueryKeys.all, 'my-subscription'] as const,
  subscriptionStatus: () => [...billingQueryKeys.all, 'subscription-status'] as const,
  upgradePrice: () => [...billingQueryKeys.all, 'upgrade-price'] as const,
};

export function usePlanConfig() { return useQuery({ queryKey: billingQueryKeys.plans(), queryFn: billingService.getPlanConfig, staleTime: 60_000 }); }
export function useUpdatePlanConfig() {
  const client = useQueryClient();
  return useMutation({ mutationFn: billingService.updatePlanConfig, onSuccess: (data) => client.setQueryData(billingQueryKeys.plans(), data) });
}
export function useMyPayments() { return useQuery({ queryKey: billingQueryKeys.myPayments(), queryFn: billingService.getMyPayments }); }
export function useAdminPayments() { return useQuery({ queryKey: billingQueryKeys.adminPayments(), queryFn: billingService.getAdminPayments }); }
export function usePendingPayments() { return useQuery({ queryKey: billingQueryKeys.pendingPayments(), queryFn: billingService.getPendingPayments, refetchInterval: 30_000 }); }
export function usePaymentActions() {
  const client = useQueryClient();
  const refresh = async () => { await Promise.all([
    client.invalidateQueries({ queryKey: billingQueryKeys.myPayments() }),
    client.invalidateQueries({ queryKey: billingQueryKeys.adminPayments() }),
    client.invalidateQueries({ queryKey: billingQueryKeys.pendingPayments() }),
    client.invalidateQueries({ queryKey: billingQueryKeys.mySubscription() }),
    client.invalidateQueries({ queryKey: billingQueryKeys.subscriptionStatus() }),
  ]); };
  return {
    createManual: useMutation({ mutationFn: (payload: CreateManualPaymentPayload) => billingService.createManualPayment(payload), onSuccess: refresh }),
    approve: useMutation({ mutationFn: (id: string) => billingService.approvePayment(id), onSuccess: refresh }),
    reject: useMutation({ mutationFn: (id: string) => billingService.rejectPayment(id), onSuccess: refresh }),
    initializePaystack: useMutation({ mutationFn: (payload: InitializePaymentPayload) => billingService.initializePaystackPayment(payload) }),
    verifyPaystack: useMutation({ mutationFn: (reference: string) => billingService.verifyPaystackPayment(reference), onSuccess: refresh }),
  };
}
export function useMySubscription() { return useQuery({ queryKey: billingQueryKeys.mySubscription(), queryFn: billingService.getMySubscription }); }
export function useSubscriptionStatus() { return useQuery({ queryKey: billingQueryKeys.subscriptionStatus(), queryFn: billingService.getSubscriptionStatus, staleTime: 15_000 }); }
export function useUpgradePrice() { return useQuery({ queryKey: billingQueryKeys.upgradePrice(), queryFn: billingService.getUpgradePrice, staleTime: 60_000 }); }

/** Build a valid Paystack request without reintroducing the removed OPay gateway. */
export function paystackPayload(type: PaymentType, target: SubscriptionPlan): InitializePaymentPayload {
  return { gateway: 'paystack', type, target };
}


