'use client';
/* React Query hooks for every referrals controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import { useReferralsMonitor, type MonitorHookOptions } from './use-monitoring';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { referralsService } from '../services/referrals.service';

export function useGetMyReferralLinkQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['referrals', 'getMyReferralLink'],
    queryFn: () => referralsService.getMyReferralLink<TData>(),
    ...options,
  });
}

export function useGetMyReferralsQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['referrals', 'getMyReferrals'],
    queryFn: () => referralsService.getMyReferrals<TData>(),
    ...options,
  });
}

export function useGetStatsQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['referrals', 'getStats'],
    queryFn: () => referralsService.getStats<TData>(),
    ...options,
  });
}

export function useGetAdminReferralsQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['referrals', 'getAdminReferrals'],
    queryFn: () => referralsService.getAdminReferrals<TData>(),
    ...options,
  });
}

export function useGetAdminReferralStatsQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['referrals', 'getAdminReferralStats'],
    queryFn: () => referralsService.getAdminReferralStats<TData>(),
    ...options,
  });
}

export function useTestQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['referrals', 'test'],
    queryFn: () => referralsService.test<TData>(),
    ...options,
  });
}

import { useQuery as useLegacyReferralQuery } from '@tanstack/react-query';
import { getMyReferralLink, getMyReferrals, getReferralStats } from '@/services/referrals.service';
export function useMyReferralLink() { return useLegacyReferralQuery({ queryKey:['my-referral-link'], queryFn:getMyReferralLink, staleTime:300_000 }); }
export function useMyReferrals() { return useLegacyReferralQuery({ queryKey:['my-referrals'], queryFn:getMyReferrals, staleTime:300_000 }); }
export function useReferralStats() { return useLegacyReferralQuery({ queryKey:['referral-stats'], queryFn:getReferralStats, staleTime:300_000 }); }


export function useGetAdminReferralsMonitorQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useReferralsMonitor(options as MonitorHookOptions) as unknown as import('@tanstack/react-query').UseQueryResult<TData, Error>;
}
