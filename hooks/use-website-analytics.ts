'use client';
/* React Query hooks for every website-analytics controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { websiteAnalyticsService } from '../services/website-analytics.service';
import type { EndSessionArgs, GetBrowsersArgs, GetCitiesArgs, GetConversionsArgs, GetDailyTrendArgs, GetDashboardArgs, GetDevicesArgs, GetEntryPagesArgs, GetEventNamesArgs, GetEventTypesArgs, GetExitPagesArgs, GetFiltersArgs, GetHourlyTrendArgs, GetLocationsArgs, GetMonthlyTrendArgs, GetOperatingSystemsArgs, GetOverviewArgs, GetPageEngagementArgs, GetPagesArgs, GetSearchesArgs, GetSourcesArgs, GetUserAnalyticsArgs, GetVisitorAnalyticsArgs, GetVisitorTypesArgs, GetVisitorsArgs, TrackEventsArgs, TrackSessionArgs } from '../types/endpoint-args/website-analytics';

export function useTrackEventsMutation<TData = any>(options?: ApiMutationHookOptions<TData, TrackEventsArgs>) {
  return useMutation<TData, Error, TrackEventsArgs>({
    mutationFn: (args: TrackEventsArgs) => websiteAnalyticsService.trackEvents<TData>(args),
    ...options,
  });
}

export function useTrackSessionMutation<TData = any>(options?: ApiMutationHookOptions<TData, TrackSessionArgs>) {
  return useMutation<TData, Error, TrackSessionArgs>({
    mutationFn: (args: TrackSessionArgs) => websiteAnalyticsService.trackSession<TData>(args),
    ...options,
  });
}

export function useEndSessionMutation<TData = any>(options?: ApiMutationHookOptions<TData, EndSessionArgs>) {
  return useMutation<TData, Error, EndSessionArgs>({
    mutationFn: (args: EndSessionArgs) => websiteAnalyticsService.endSession<TData>(args),
    ...options,
  });
}

export function useGetOverviewQuery<TData = any>(args?: GetOverviewArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getOverview', args ?? null],
    queryFn: () => websiteAnalyticsService.getOverview<TData>(args),
    ...options,
  });
}

export function useGetDashboardQuery<TData = any>(args?: GetDashboardArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getDashboard', args ?? null],
    queryFn: () => websiteAnalyticsService.getDashboard<TData>(args),
    ...options,
  });
}

export function useGetPageEngagementQuery<TData = any>(args?: GetPageEngagementArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getPageEngagement', args ?? null],
    queryFn: () => websiteAnalyticsService.getPageEngagement<TData>(args),
    ...options,
  });
}

export function useGetVisitorTypesQuery<TData = any>(args?: GetVisitorTypesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getVisitorTypes', args ?? null],
    queryFn: () => websiteAnalyticsService.getVisitorTypes<TData>(args),
    ...options,
  });
}

export function useGetConversionsQuery<TData = any>(args?: GetConversionsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getConversions', args ?? null],
    queryFn: () => websiteAnalyticsService.getConversions<TData>(args),
    ...options,
  });
}

export function useGetPagesQuery<TData = any>(args?: GetPagesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getPages', args ?? null],
    queryFn: () => websiteAnalyticsService.getPages<TData>(args),
    ...options,
  });
}

export function useGetEntryPagesQuery<TData = any>(args?: GetEntryPagesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getEntryPages', args ?? null],
    queryFn: () => websiteAnalyticsService.getEntryPages<TData>(args),
    ...options,
  });
}

export function useGetExitPagesQuery<TData = any>(args?: GetExitPagesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getExitPages', args ?? null],
    queryFn: () => websiteAnalyticsService.getExitPages<TData>(args),
    ...options,
  });
}

export function useGetVisitorsQuery<TData = any>(args?: GetVisitorsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getVisitors', args ?? null],
    queryFn: () => websiteAnalyticsService.getVisitors<TData>(args),
    ...options,
  });
}

export function useGetSourcesQuery<TData = any>(args?: GetSourcesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getSources', args ?? null],
    queryFn: () => websiteAnalyticsService.getSources<TData>(args),
    ...options,
  });
}

export function useGetLocationsQuery<TData = any>(args?: GetLocationsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getLocations', args ?? null],
    queryFn: () => websiteAnalyticsService.getLocations<TData>(args),
    ...options,
  });
}

export function useGetCitiesQuery<TData = any>(args?: GetCitiesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getCities', args ?? null],
    queryFn: () => websiteAnalyticsService.getCities<TData>(args),
    ...options,
  });
}

export function useGetDevicesQuery<TData = any>(args?: GetDevicesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getDevices', args ?? null],
    queryFn: () => websiteAnalyticsService.getDevices<TData>(args),
    ...options,
  });
}

export function useGetBrowsersQuery<TData = any>(args?: GetBrowsersArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getBrowsers', args ?? null],
    queryFn: () => websiteAnalyticsService.getBrowsers<TData>(args),
    ...options,
  });
}

export function useGetOperatingSystemsQuery<TData = any>(args?: GetOperatingSystemsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getOperatingSystems', args ?? null],
    queryFn: () => websiteAnalyticsService.getOperatingSystems<TData>(args),
    ...options,
  });
}

export function useGetEventTypesQuery<TData = any>(args?: GetEventTypesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getEventTypes', args ?? null],
    queryFn: () => websiteAnalyticsService.getEventTypes<TData>(args),
    ...options,
  });
}

export function useGetEventNamesQuery<TData = any>(args?: GetEventNamesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getEventNames', args ?? null],
    queryFn: () => websiteAnalyticsService.getEventNames<TData>(args),
    ...options,
  });
}

export function useGetSearchesQuery<TData = any>(args?: GetSearchesArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getSearches', args ?? null],
    queryFn: () => websiteAnalyticsService.getSearches<TData>(args),
    ...options,
  });
}

export function useGetFiltersQuery<TData = any>(args?: GetFiltersArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getFilters', args ?? null],
    queryFn: () => websiteAnalyticsService.getFilters<TData>(args),
    ...options,
  });
}

export function useGetHourlyTrendQuery<TData = any>(args?: GetHourlyTrendArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getHourlyTrend', args ?? null],
    queryFn: () => websiteAnalyticsService.getHourlyTrend<TData>(args),
    ...options,
  });
}

export function useGetDailyTrendQuery<TData = any>(args?: GetDailyTrendArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getDailyTrend', args ?? null],
    queryFn: () => websiteAnalyticsService.getDailyTrend<TData>(args),
    ...options,
  });
}

export function useGetMonthlyTrendQuery<TData = any>(args?: GetMonthlyTrendArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getMonthlyTrend', args ?? null],
    queryFn: () => websiteAnalyticsService.getMonthlyTrend<TData>(args),
    ...options,
  });
}

export function useGetRealtimeQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getRealtime'],
    queryFn: () => websiteAnalyticsService.getRealtime<TData>(),
    ...options,
  });
}

export function useGetUserAnalyticsQuery<TData = any>(args: GetUserAnalyticsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getUserAnalytics', args ?? null],
    queryFn: () => websiteAnalyticsService.getUserAnalytics<TData>(args),
    ...options,
  });
}

export function useGetVisitorAnalyticsQuery<TData = any>(args: GetVisitorAnalyticsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['website-analytics', 'getVisitorAnalytics', args ?? null],
    queryFn: () => websiteAnalyticsService.getVisitorAnalytics<TData>(args),
    ...options,
  });
}
