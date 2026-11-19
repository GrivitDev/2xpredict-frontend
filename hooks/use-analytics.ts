'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ApiQueryHookOptions } from '../types/common';
import { analyticsService } from '../services/analytics.service';
import { AnalyticsClient } from '@/lib/analytics/analytics-client';
import type { AnalyticsEventInput } from '@/lib/analytics/analytics-types';
import type { AnalyticsDashboardResponse, PublicAnalyticsStats } from '../types/analytics';

export function useGetPublicStatsQuery(options?: ApiQueryHookOptions<PublicAnalyticsStats>) {
  return useQuery({
    queryKey: ['analytics', 'public-stats'],
    queryFn: analyticsService.getPublicStats,
    staleTime: 60_000,
    ...options,
  });
}

export function useGetDashboardQuery<TData = AnalyticsDashboardResponse>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['analytics', 'getDashboard'],
    queryFn: () => analyticsService.getDashboard<TData>(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Shared browser analytics bridge; kept separate from the admin business dashboard.
let activeAnalyticsClient: AnalyticsClient | null = null;
export function setAnalyticsClient(client: AnalyticsClient | null) {
  activeAnalyticsClient = client;
}

export interface AnalyticsApi {
  track(event: AnalyticsEventInput): void;
  pageView(path: string): void;
  heartbeat(durationMs?: number): void;
  getVisitorId(): string;
  getSessionId(): string;
}

export function useAnalytics(): AnalyticsApi {
  return useMemo(() => ({
    track(event) { activeAnalyticsClient?.track(event); },
    pageView(path) { activeAnalyticsClient?.pageView(path); },
    heartbeat(_durationMs) { activeAnalyticsClient?.heartbeat(); },
    getVisitorId() { return activeAnalyticsClient?.getVisitorId() ?? ''; },
    getSessionId() { return activeAnalyticsClient?.getSessionId() ?? ''; },
  }), []);
}
