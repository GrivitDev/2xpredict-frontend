'use client';
import { usePromosMonitor, type MonitorHookOptions } from './use-monitoring';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { promosService } from '@/services/promos.service';
import type { CreatePromoPayload, PromoClaimPayload, UpdatePromoPayload } from '@/types/promos';

type QueryExtras = Omit<UseQueryOptions<any, Error, any, readonly unknown[]>, 'queryKey' | 'queryFn'>;

const keys = {
  all: ['promos'] as const,
  list: ['promos', 'list'] as const,
  active: ['promos', 'active'] as const,
  direct: ['promos', 'active', 'direct'] as const,
  referral: ['promos', 'active', 'referral'] as const,
  redemptions: ['promos', 'admin', 'redemptions'] as const,
  analytics: (promoId?: string) => ['promos', 'admin', 'analytics', promoId ?? 'all'] as const,
  rewards: ['promos', 'admin', 'rewards'] as const,
  claimedRewards: ['promos', 'admin', 'claimed-rewards'] as const,
};

export function usePromos(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.list, queryFn: () => promosService.findAll<any[]>(), ...options });
}
export function useActivePromos(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.active, queryFn: () => promosService.active<any[]>(), ...options });
}
export function useDirectPromos(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.direct, queryFn: () => promosService.getDirectPromos<any[]>(), ...options });
}
export function useReferralPromos(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.referral, queryFn: () => promosService.getReferralPromos<any[]>(), ...options });
}
export function usePromo(id: string, options: QueryExtras = {}) {
  return useQuery({ queryKey: ['promos', 'detail', id], queryFn: () => promosService.findOne<any>({ path: { id } }), enabled: Boolean(id), ...options });
}
export function usePromoRewards(promoId: string, options: QueryExtras = {}) {
  return useQuery({ queryKey: ['promos', 'rewards', promoId], queryFn: () => promosService.getPromoRewards<any>({ path: { promoId } }), enabled: Boolean(promoId), ...options });
}
export function usePromoRedemptions(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.redemptions, queryFn: () => promosService.getRedemptions<any[]>(), ...options });
}
export function usePromoAnalytics(promoId?: string, options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.analytics(promoId), queryFn: () => promosService.getAnalytics<any>(promoId), ...options });
}
export function useAllAwardedRewards(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.rewards, queryFn: () => promosService.getAllAwardedRewards<any[]>(), ...options });
}
export function useAllClaimedRewards(options: QueryExtras = {}) {
  return useQuery({ queryKey: keys.claimedRewards, queryFn: () => promosService.getAllClaimedRewards<any[]>(), ...options });
}
export function useMyPromoProgress(options: QueryExtras = {}) {
  return useQuery({ queryKey: ['promos', 'my-progress'], queryFn: () => promosService.getMyProgress<any>(), ...options });
}
export function useMyRewards(options: QueryExtras = {}) {
  return useQuery({ queryKey: ['promos', 'my-rewards'], queryFn: () => promosService.getMyRewards<any[]>(), ...options });
}
export function useMyRedemptions(options: QueryExtras = {}) {
  return useQuery({ queryKey: ['promos', 'my-redemptions'], queryFn: () => promosService.getMyRedemptions<any[]>(), ...options });
}
export function usePromoJoinStatus(promoId: string, options: QueryExtras = {}) {
  return useQuery({ queryKey: ['promos', 'join-status', promoId], queryFn: () => promosService.getJoinStatus<any>({ path: { promoId } }), enabled: Boolean(promoId), ...options });
}

function useInvalidatePromos() {
  const client = useQueryClient();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: keys.all }),
      client.invalidateQueries({ queryKey: ['promos', 'admin'] }),
    ]);
  };
}
export function useCreatePromo() {
  const invalidate = useInvalidatePromos();
  return useMutation({ mutationFn: (payload: CreatePromoPayload) => promosService.create({ body: payload }), onSuccess: invalidate });
}
export function useUpdatePromo() {
  const invalidate = useInvalidatePromos();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: UpdatePromoPayload }) => promosService.update({ path: { id }, body: payload }), onSuccess: invalidate });
}
export function useDeactivatePromo() {
  const invalidate = useInvalidatePromos();
  return useMutation({ mutationFn: (id: string) => promosService.deactivate({ path: { id } }), onSuccess: invalidate });
}
export function useClaimPromo() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload: PromoClaimPayload) => promosService.claim(payload), onSuccess: () => client.invalidateQueries({ queryKey: ['promos'] }) });
}
export function useJoinPromo() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (promoId: string) => promosService.joinReferralCampaign({ path: { promoId } }), onSuccess: (_data, promoId) => {
    void client.invalidateQueries({ queryKey: keys.referral });
    void client.invalidateQueries({ queryKey: ['promos', 'my-progress'] });
    void client.invalidateQueries({ queryKey: ['promos', 'join-status', promoId] });
    void client.invalidateQueries({ queryKey: ['promos', 'my-rewards'] });
  } });
}

// Backwards-compatible hook aliases; no cash-payout hooks are exposed.
export const useFindAllQuery = usePromos;
export const useActiveQuery = useActivePromos;
export const useGetDirectPromosQuery = useDirectPromos;
export const useGetReferralPromosQuery = useReferralPromos;
export const useGetMyProgressQuery = useMyPromoProgress;
export const useGetMyRewardsQuery = useMyRewards;
export const useGetMyRedemptionsQuery = useMyRedemptions;
export const useGetAllAwardedRewardsQuery = useAllAwardedRewards;
export const useGetAllClaimedRewardsQuery = useAllClaimedRewards;
export const useGetRedemptionsQuery = usePromoRedemptions;
export const useGetAnalyticsQuery = usePromoAnalytics;


/** Admin operational monitor from PromosController. */
export function usePromosModuleMonitor(options: MonitorHookOptions = {}) { return usePromosMonitor(options); }

