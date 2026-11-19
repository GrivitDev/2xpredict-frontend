import { apiRequest } from '../lib/axios';
import type { AnalyticsDashboardResponse, PublicAnalyticsStats } from '../types/analytics';

export const analyticsService = {
  getPublicStats: () =>
    apiRequest<PublicAnalyticsStats>({ method: 'GET', path: '/analytics/public-stats' }),

  getDashboard: <TResponse = AnalyticsDashboardResponse>() =>
    apiRequest<TResponse>({ method: 'GET', path: '/analytics/dashboard' }),
} as const;
