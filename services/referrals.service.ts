import { apiRequest } from '../lib/axios';
import type { ReferralsMonitorResponse } from '../types/monitoring';

/** Single client for public, admin and monitoring endpoints in Referrals. */
export const referralsService = {
  getMyReferralLink: <TResponse = unknown>() => apiRequest<TResponse>({ method: 'GET', path: '/referrals/my-link' }),
  getMyReferrals: <TResponse = unknown>() => apiRequest<TResponse>({ method: 'GET', path: '/referrals/my-referrals' }),
  getStats: <TResponse = unknown>() => apiRequest<TResponse>({ method: 'GET', path: '/referrals/stats' }),
  getAdminReferrals: <TResponse = unknown>() => apiRequest<TResponse>({ method: 'GET', path: '/referrals/admin/all' }),
  getAdminReferralStats: <TResponse = unknown>() => apiRequest<TResponse>({ method: 'GET', path: '/referrals/admin/stats' }),
  test: <TResponse = unknown>() => apiRequest<TResponse>({ method: 'GET', path: '/referrals/test' }),
  getModuleMonitor: () => apiRequest<ReferralsMonitorResponse>({ method: 'GET', path: '/referrals/admin/monitor' }),
} as const;

export const getMyReferralLink = () => referralsService.getMyReferralLink<any>();
export const getMyReferrals = () => referralsService.getMyReferrals<any>();
export const getReferralStats = () => referralsService.getStats<any>();
export const getAdminReferrals = () => referralsService.getAdminReferrals<any>();
export const getAdminReferralStats = () => referralsService.getAdminReferralStats<any>();
