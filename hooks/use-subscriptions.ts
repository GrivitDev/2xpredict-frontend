'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiQueryHookOptions } from '../types/common';
import { subscriptionsService } from '../services/subscriptions.service';
import type { Subscription, SubscriptionEntitlementsResponse, SubscriptionStatusResponse, UpgradePriceResponse } from '../types/subscriptions';
import type { SubscriptionsMonitorResponse } from '../types/monitoring';
import { useAuth } from '../providers/auth-provider';

export const subscriptionsQueryKeys = {
  all: ['subscriptions'] as const,
  mine: (principal: string) => ['subscriptions', 'mine', principal] as const,
  status: (principal: string) => ['subscriptions', 'status', principal] as const,
  entitlements: (principal: string) => ['subscriptions', 'entitlements', principal] as const,
  upgradePrice: (principal: string) => ['subscriptions', 'upgrade-price', principal] as const,
  monitor: () => ['subscriptions', 'admin', 'monitor'] as const,
};

function useSubscriptionPrincipal() {
  const { user, token, loading } = useAuth();
  return {
    principal: String(user?.userId ?? (token ? 'authenticated' : 'anonymous')),
    loading,
    authenticated: Boolean(user || token),
  };
}

export function useGetMySubscriptionQuery(options?: ApiQueryHookOptions<Subscription | null>) {
  const { principal, loading, authenticated } = useSubscriptionPrincipal();
  return useQuery({ queryKey: subscriptionsQueryKeys.mine(principal), queryFn: subscriptionsService.getMySubscription, ...options, enabled: !loading && authenticated && options?.enabled !== false });
}
export function useGetStatusQuery(options?: ApiQueryHookOptions<SubscriptionStatusResponse>) {
  const { principal, loading, authenticated } = useSubscriptionPrincipal();
  return useQuery({ queryKey: subscriptionsQueryKeys.status(principal), queryFn: subscriptionsService.getStatus, staleTime: 15_000, refetchOnWindowFocus: true, ...options, enabled: !loading && authenticated && options?.enabled !== false });
}
export function useGetEntitlementsQuery(options?: ApiQueryHookOptions<SubscriptionEntitlementsResponse>) {
  const { principal, loading } = useSubscriptionPrincipal();
  return useQuery({
    queryKey: subscriptionsQueryKeys.entitlements(String(principal)),
    queryFn: subscriptionsService.getEntitlements,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    ...options,
    enabled: !loading && options?.enabled !== false,
  });
}
export function useGetUpgradePriceQuery(options?: ApiQueryHookOptions<UpgradePriceResponse>) {
  const { principal, loading, authenticated } = useSubscriptionPrincipal();
  return useQuery({ queryKey: subscriptionsQueryKeys.upgradePrice(principal), queryFn: subscriptionsService.getUpgradePrice, staleTime: 30_000, ...options, enabled: !loading && authenticated && options?.enabled !== false });
}
export function useSubscriptionsMonitor(options?: ApiQueryHookOptions<SubscriptionsMonitorResponse>) {
  return useQuery({ queryKey: subscriptionsQueryKeys.monitor(), queryFn: subscriptionsService.getModuleMonitor, staleTime: 30_000, refetchInterval: 60_000, ...options });
}
export const useGetAdminSubscriptionsMonitorQuery = useSubscriptionsMonitor;
