import { apiRequest } from '../lib/axios';
import type { CreateArgs, DeactivateArgs, FindOneArgs, GetJoinStatusArgs, GetPromoRewardsArgs, JoinReferralCampaignArgs, UpdateArgs } from '../types/endpoint-args/promos';
import type { PromoClaimPayload } from '../types/promos';
import type { PromosMonitorResponse } from '../types/monitoring';

/** Single client for public, admin and monitoring endpoints in Promos. */
export const promosService = {
  findAll: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos' }),
  active: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/active' }),
  getDirectPromos: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/active/direct' }),
  getReferralPromos: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/active/referral' }),
  getMyProgress: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/my-progress' }),
  getMyRewards: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/my-rewards' }),
  getMyRedemptions: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/my-redemptions' }),
  claim: <T = unknown>(body: PromoClaimPayload) => apiRequest<T>({ method: 'POST', path: '/promos/claim', body }),
  create: <T = unknown>(args: CreateArgs) => apiRequest<T>({ method: 'POST', path: '/promos', body: args.body }),
  getAllAwardedRewards: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/admin/rewards' }),
  getAllClaimedRewards: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/admin/claimed-rewards' }),
  getRedemptions: <T = unknown>() => apiRequest<T>({ method: 'GET', path: '/promos/admin/redemptions' }),
  getAnalytics: <T = unknown>(promoId?: string) => apiRequest<T>({ method: 'GET', path: '/promos/admin/analytics', query: promoId ? { promoId } : undefined }),
  getJoinStatus: <T = unknown>(args: GetJoinStatusArgs) => apiRequest<T>({ method: 'GET', path: '/promos/:promoId/status', pathParams: args.path }),
  joinReferralCampaign: <T = unknown>(args: JoinReferralCampaignArgs) => apiRequest<T>({ method: 'POST', path: '/promos/:promoId/join', pathParams: args.path }),
  findOne: <T = unknown>(args: FindOneArgs) => apiRequest<T>({ method: 'GET', path: '/promos/:id', pathParams: args.path }),
  update: <T = unknown>(args: UpdateArgs) => apiRequest<T>({ method: 'PATCH', path: '/promos/:id', pathParams: args.path, body: args.body }),
  deactivate: <T = unknown>(args: DeactivateArgs) => apiRequest<T>({ method: 'PATCH', path: '/promos/:id/deactivate', pathParams: args.path }),
  getPromoRewards: <T = unknown>(args: GetPromoRewardsArgs) => apiRequest<T>({ method: 'GET', path: '/promos/:promoId/rewards', pathParams: args.path }),
  getModuleMonitor: () => apiRequest<PromosMonitorResponse>({ method: 'GET', path: '/promos/admin/monitor' }),
} as const;

// Existing UI-friendly exports retained where their behavior still matches the API.
export const getPromos = () => promosService.findAll<any[]>();
export const getActivePromos = () => promosService.active<any[]>();
export const getDirectPromos = () => promosService.getDirectPromos<any[]>();
export const getReferralPromos = () => promosService.getReferralPromos<any[]>();
export const getMyPromoProgress = () => promosService.getMyProgress<any>();
export const getMyRewards = () => promosService.getMyRewards<any[]>();
export const getMyRedemptions = () => promosService.getMyRedemptions<any[]>();
export const getAllAwardedRewards = () => promosService.getAllAwardedRewards<any[]>();
export const getAllClaimedRewards = () => promosService.getAllClaimedRewards<any[]>();
export const getPromoRedemptions = () => promosService.getRedemptions<any[]>();
export const getPromoAnalytics = (promoId?: string) => promosService.getAnalytics<any>(promoId);
export const getPromoStatus = (promoId: string) => promosService.getJoinStatus({ path: { promoId } });
export const joinPromo = (promoId: string) => promosService.joinReferralCampaign({ path: { promoId } });
export const createPromo = (payload: import('../types/promos').CreatePromoPayload) => promosService.create({ body: payload });
export const getPromo = (id: string) => promosService.findOne<import('../types/promos').Promo>({ path: { id } });
export const updatePromo = (id: string, payload: import('../types/promos').UpdatePromoPayload) => promosService.update({ path: { id }, body: payload });
export const deactivatePromo = (id: string) => promosService.deactivate({ path: { id } });
export const getPromoRewards = (id: string) => promosService.getPromoRewards({ path: { promoId: id } });
