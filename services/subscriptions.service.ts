import { apiRequest } from '../lib/axios';
import type { Subscription, SubscriptionEntitlementsResponse, SubscriptionStatusResponse, UpgradePriceResponse } from '../types/subscriptions';
import type { SubscriptionsMonitorResponse } from '../types/monitoring';

/** Client for the Subscriptions NestJS module. */
export const subscriptionsService = {
  getMySubscription: () =>
    apiRequest<Subscription | null>({ method: 'GET', path: '/subscriptions/me' }),
  getStatus: () =>
    apiRequest<SubscriptionStatusResponse>({ method: 'GET', path: '/subscriptions/status' }),
  getEntitlements: () =>
    apiRequest<SubscriptionEntitlementsResponse>({ method: 'GET', path: '/subscriptions/entitlements' }),
  getUpgradePrice: () =>
    apiRequest<UpgradePriceResponse>({ method: 'GET', path: '/subscriptions/upgrade-price' }),
  getModuleMonitor: () =>
    apiRequest<SubscriptionsMonitorResponse>({ method: 'GET', path: '/subscriptions/admin/monitor' }),
} as const;
