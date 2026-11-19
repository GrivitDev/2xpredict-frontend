import { apiRequest } from '../lib/axios';
import type {
  CreateArgs,
  FindOneArgs,
  RemoveArgs,
  ToggleStatusArgs,
  UpdateArgs,
  ListArgs,
  AnalyticsArgs,
  EventsArgs,
  DiscoverArgs,
  PreviewArgs,
  UpdateExternalPolicyArgs,
} from '../types/endpoint-args/ads';
import type {
  GetAdsArgs,
  RecordClickArgs,
  RecordImpressionArgs,
  TrackEventArgs,
} from '../types/endpoint-args/ads';
import type {
  AdPolicyResponse,
  PublicAd,
  TrackAdEventPayload,
  AdminAd,
  AdAnalytics,
  AdCampaignAnalytics,
  AdEventRecord,
  AdPreviewResponse,
  DiscoverContentResponse,
  ExternalAdPolicy,
  Paginated,
  AdsListQuery,
  AdEventQuery,
  AdAnalyticsQuery,
  CreateAdPayload,
  UpdateAdPayload,
  AutomationOption,
} from '../types/ads';

/** Single client for the NestJS Ads module (public delivery and admin management). */
export const adsService = {
  // Public ads controller
  getPolicy: () => apiRequest<AdPolicyResponse>({ method: 'GET', path: '/ads/policy' }),
  getAds: (args: GetAdsArgs) =>
    apiRequest<PublicAd[]>({ method: 'GET', path: '/ads', query: args.query }),
  trackEvent: (args: TrackEventArgs) =>
    apiRequest<{ success: boolean; duplicate?: boolean }>({
      method: 'POST', path: '/ads/:id/events', pathParams: args.path, body: args.body,
    }),
  recordImpression: (args: RecordImpressionArgs) =>
    apiRequest<{ success: boolean; duplicate?: boolean }>({
      method: 'POST', path: '/ads/:id/impression', pathParams: args.path,
      body: { ...args.body, type: 'IMPRESSION' },
    }),
  recordClick: (args: RecordClickArgs) =>
    apiRequest<{ success: boolean; duplicate?: boolean }>({
      method: 'POST', path: '/ads/:id/click', pathParams: args.path,
      body: { ...args.body, type: 'CLICK' },
    }),

  // Admin ads controller
  create: (args: CreateArgs) =>
    apiRequest<AdminAd>({ method: 'POST', path: '/admin/ads', body: args.body }),
  findAll: (args: ListArgs = {}) =>
    apiRequest<AdminAd[] | Paginated<AdminAd>>({ method: 'GET', path: '/admin/ads', query: args.query }),
  findOne: (args: FindOneArgs) =>
    apiRequest<AdminAd>({ method: 'GET', path: '/admin/ads/:id', pathParams: args.path }),
  update: (args: UpdateArgs) =>
    apiRequest<AdminAd>({ method: 'PATCH', path: '/admin/ads/:id', pathParams: args.path, body: args.body }),
  remove: (args: RemoveArgs) =>
    apiRequest<{ success: boolean; message: string }>({ method: 'DELETE', path: '/admin/ads/:id', pathParams: args.path }),
  toggleStatus: (args: ToggleStatusArgs) =>
    apiRequest<{ success: boolean; isActive: boolean }>({ method: 'PATCH', path: '/admin/ads/:id/status', pathParams: args.path }),
  analytics: (args: AnalyticsArgs = {}) =>
    apiRequest<AdAnalytics>({ method: 'GET', path: '/admin/ads/analytics/overview', query: args.query }),
  adAnalytics: (args: FindOneArgs & AnalyticsArgs) =>
    apiRequest<AdCampaignAnalytics>({ method: 'GET', path: '/admin/ads/analytics/:id', pathParams: args.path, query: args.query }),
  events: (args: EventsArgs = {}) =>
    apiRequest<Paginated<AdEventRecord>>({ method: 'GET', path: '/admin/ads/events', query: args.query }),
  automationOptions: () =>
    apiRequest<AutomationOption[]>({ method: 'GET', path: '/admin/ads/automation-options' }),
  discover: (args: DiscoverArgs = {}) =>
    apiRequest<DiscoverContentResponse>({ method: 'GET', path: '/admin/ads/discover', query: args.query }),
  preview: (args: PreviewArgs) =>
    apiRequest<AdPreviewResponse>({ method: 'GET', path: '/admin/ads/:id/preview', pathParams: args.path, query: args.query }),
  externalPolicy: () =>
    apiRequest<ExternalAdPolicy>({ method: 'GET', path: '/admin/ads/external-policy' }),
  updateExternalPolicy: (args: UpdateExternalPolicyArgs) =>
    apiRequest<ExternalAdPolicy>({ method: 'PATCH', path: '/admin/ads/external-policy', body: args.body }),

  // Operational endpoint belongs to Ads, not System Monitor.
  getMonitor: () => apiRequest<import('../types/monitoring').AdsMonitorResponse>({
    method: 'GET', path: '/admin/ads/monitor',
  }),
} as const;

/** Backward-compatible object name; implementation remains in this module file. */
export const adminAdsService = adsService;

/** The page-placement helper belongs to the separate Internal Ads module. */
export { getPageAds } from './internal-ads.service';
export type { AdsListQuery, AdEventQuery, AdAnalyticsQuery, CreateAdPayload, UpdateAdPayload, TrackAdEventPayload };

/** Compatibility helper retained for older call sites. */
export async function updateAdminAd(input: { id: string; payload?: UpdateAdPayload; data?: UpdateAdPayload }) {
  return adsService.update({ path: { id: input.id }, body: input.payload ?? input.data ?? {} });
}
