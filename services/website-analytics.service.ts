/* Generated from backend controller: website-analytics/website-analytics.controller.ts. */
import { apiRequest } from '../lib/axios';
import type { EndSessionArgs, GetBrowsersArgs, GetCitiesArgs, GetConversionsArgs, GetDailyTrendArgs, GetDashboardArgs, GetDevicesArgs, GetEntryPagesArgs, GetEventNamesArgs, GetEventTypesArgs, GetExitPagesArgs, GetFiltersArgs, GetHourlyTrendArgs, GetLocationsArgs, GetMonthlyTrendArgs, GetOperatingSystemsArgs, GetOverviewArgs, GetPageEngagementArgs, GetPagesArgs, GetSearchesArgs, GetSourcesArgs, GetUserAnalyticsArgs, GetVisitorAnalyticsArgs, GetVisitorTypesArgs, GetVisitorsArgs, TrackEventsArgs, TrackSessionArgs } from '../types/endpoint-args/website-analytics';

export const websiteAnalyticsService = {
  trackEvents: <TResponse = any>(args: TrackEventsArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/website-analytics/events',
      body: args.body,
    });
  },
  trackSession: <TResponse = any>(args: TrackSessionArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/website-analytics/session',
      body: args.body,
    });
  },
  endSession: <TResponse = any>(args: EndSessionArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/website-analytics/session/end',
      body: args.body,
    });
  },
  getOverview: <TResponse = any>(args?: GetOverviewArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/overview',
      query: args?.query,
    });
  },
  getDashboard: <TResponse = any>(args?: GetDashboardArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/dashboard',
      query: args?.query,
    });
  },
  getPageEngagement: <TResponse = any>(args?: GetPageEngagementArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/page-engagement',
      query: args?.query,
    });
  },
  getVisitorTypes: <TResponse = any>(args?: GetVisitorTypesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/visitor-types',
      query: args?.query,
    });
  },
  getConversions: <TResponse = any>(args?: GetConversionsArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/conversions',
      query: args?.query,
    });
  },
  getPages: <TResponse = any>(args?: GetPagesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/pages',
      query: args?.query,
    });
  },
  getEntryPages: <TResponse = any>(args?: GetEntryPagesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/entry-pages',
      query: args?.query,
    });
  },
  getExitPages: <TResponse = any>(args?: GetExitPagesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/exit-pages',
      query: args?.query,
    });
  },
  getVisitors: <TResponse = any>(args?: GetVisitorsArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/visitors',
      query: args?.query,
    });
  },
  getSources: <TResponse = any>(args?: GetSourcesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/sources',
      query: args?.query,
    });
  },
  getLocations: <TResponse = any>(args?: GetLocationsArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/locations',
      query: args?.query,
    });
  },
  getCities: <TResponse = any>(args?: GetCitiesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/cities',
      query: args?.query,
    });
  },
  getDevices: <TResponse = any>(args?: GetDevicesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/devices',
      query: args?.query,
    });
  },
  getBrowsers: <TResponse = any>(args?: GetBrowsersArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/browsers',
      query: args?.query,
    });
  },
  getOperatingSystems: <TResponse = any>(args?: GetOperatingSystemsArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/operating-systems',
      query: args?.query,
    });
  },
  getEventTypes: <TResponse = any>(args?: GetEventTypesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/events',
      query: args?.query,
    });
  },
  getEventNames: <TResponse = any>(args?: GetEventNamesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/event-names',
      query: args?.query,
    });
  },
  getSearches: <TResponse = any>(args?: GetSearchesArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/searches',
      query: args?.query,
    });
  },
  getFilters: <TResponse = any>(args?: GetFiltersArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/filters',
      query: args?.query,
    });
  },
  getHourlyTrend: <TResponse = any>(args?: GetHourlyTrendArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/trend/hourly',
      query: args?.query,
    });
  },
  getDailyTrend: <TResponse = any>(args?: GetDailyTrendArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/trend/daily',
      query: args?.query,
    });
  },
  getMonthlyTrend: <TResponse = any>(args?: GetMonthlyTrendArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/trend/monthly',
      query: args?.query,
    });
  },
  getRealtime: <TResponse = any>() => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/realtime',
    });
  },
  getUserAnalytics: <TResponse = any>(args: GetUserAnalyticsArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/users/:userId',
      pathParams: args.path,
    });
  },
  getVisitorAnalytics: <TResponse = any>(args: GetVisitorAnalyticsArgs) => {
    return apiRequest<TResponse>({
      method: 'GET',
      path: '/website-analytics/visitors/:visitorId',
      pathParams: args.path,
    });
  },
} as const;

export const getWebsiteAnalyticsOverview = () => websiteAnalyticsService.getOverview<any>();
export const getWebsiteAnalytics = () => websiteAnalyticsService.getDashboard<any>();
export const getWebsiteAnalyticsPages = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getPages<any>({query:params as never});
export const getWebsiteAnalyticsEntryPages = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getEntryPages<any>({query:params as never});
export const getWebsiteAnalyticsExitPages = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getExitPages<any>({query:params as never});
export const getWebsiteAnalyticsVisitors = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getVisitors<any>({query:params as never});
export const getWebsiteAnalyticsSources = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getSources<any>({query:params as never});
export const getWebsiteAnalyticsCountries = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getLocations<any>({query:params as never});
export const getWebsiteAnalyticsDevices = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getDevices<any>({query:params as never});
export const getWebsiteAnalyticsBrowsers = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getBrowsers<any>({query:params as never});
export const getWebsiteAnalyticsOperatingSystems = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getOperatingSystems<any>({query:params as never});
export const getWebsiteAnalyticsEvents = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getEventTypes<any>({query:params as never});
export const getWebsiteAnalyticsDailyTrend = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getDailyTrend<any>({query:params as never});
export const getWebsiteAnalyticsMonthlyTrend = (params: Record<string, unknown> = {}) => websiteAnalyticsService.getMonthlyTrend<any>({query:params as never});
export const getWebsiteAnalyticsRealtime = () => websiteAnalyticsService.getRealtime<any>();


export interface AnalyticsBrowser { browser: string; sessions: number; visitors?: number; count?: number; [key: string]: unknown; }
export interface AnalyticsCountry { country: string; countryCode?: string; sessions?: number; visitors?: number; count?: number; [key: string]: unknown; }
export interface AnalyticsDevice { device: string; sessions?: number; visitors?: number; count?: number; [key: string]: unknown; }
export type AnalyticsEventType = string;
export interface AnalyticsOperatingSystem { operatingSystem: string; sessions?: number; visitors?: number; count?: number; [key: string]: unknown; }
export interface AnalyticsPage { path: string; pageViews?: number; views?: number; uniqueVisitors?: number; [key: string]: unknown; }
export interface AnalyticsTrafficSource { source: string; sessions?: number; visitors?: number; count?: number; [key: string]: unknown; }
export interface AnalyticsTrend { date: string; sessions?: number; visitors?: number; pageViews?: number; [key: string]: unknown; }
export interface AnalyticsVisitorBreakdown { type: string; visitors?: number; sessions?: number; count?: number; [key: string]: unknown; }
export interface WebsiteAnalyticsOverview { [key: string]: unknown; }

