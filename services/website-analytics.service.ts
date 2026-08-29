import api from '@/lib/axios';

export interface WebsiteAnalyticsQuery {
  from?: string;
  to?: string;
  limit?: number | string;
}

export interface WebsiteAnalyticsOverview {
  visitors: number;
  sessions: number;
  activeSessions: number;
  pageViews: number;
  events: number;

  totalTimeMs: number;

  averageSessionDurationMs: number;

  bounceRate: number;

  bouncedSessions: number;
}

export interface AnalyticsPage {
  path: string;
  views: number;
  uniqueVisitors: number;
}

export interface AnalyticsVisitorBreakdown {
  visitorType: string;
  visitors: number;
}

export interface AnalyticsDevice {
  deviceType: string;
  sessions: number;
  visitors: number;
}

export interface AnalyticsBrowser {
  browser: string;
  sessions: number;
  visitors: number;
}

export interface AnalyticsOperatingSystem {
  operatingSystem: string;
  sessions: number;
  visitors: number;
}

export interface AnalyticsCountry {
  country: string;
  countryCode: string;
  sessions: number;
  visitors: number;
}

export interface AnalyticsCity {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  sessions: number;
  visitors: number;
}

export interface AnalyticsTrafficSource {
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  sessions: number;
  visitors: number;
}

export interface AnalyticsEventType {
  eventType: string;
  count: number;
  visitors: number;
}

export interface AnalyticsTrend {
  date?: string;
  month?: string;

  hour?: number;

  events: number;
  pageViews: number;
  visitors: number;
  sessions: number;
}

export interface WebsiteAnalyticsDashboard {
  overview: WebsiteAnalyticsOverview;

  visitors: AnalyticsVisitorBreakdown[];

  pages: {
    top: AnalyticsPage[];
    entry: AnalyticsPage[];
    exit: AnalyticsPage[];
  };

  technology: {
    devices: AnalyticsDevice[];
    browsers: AnalyticsBrowser[];
    operatingSystems: AnalyticsOperatingSystem[];
  };

  geography: {
    countries: AnalyticsCountry[];
  };

  traffic: {
    sources: AnalyticsTrafficSource[];
  };

  events: AnalyticsEventType[];
}

async function get<T>(
  url: string,
  query: WebsiteAnalyticsQuery,
): Promise<T> {
  const response = await api.get<T>(
    url,
    {
      params: query,
    },
  );

  return response.data;
}

export async function getWebsiteAnalyticsOverview(
  query: WebsiteAnalyticsQuery,
) {
  return get<WebsiteAnalyticsOverview>(
    '/website-analytics/overview',
    query,
  );
}

export async function getWebsiteAnalyticsPages(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsPage[]>(
    '/website-analytics/pages',
    {
      ...query,
      limit: '20',
    },
  );
}

export async function getWebsiteAnalyticsEntryPages(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsPage[]>(
    '/website-analytics/entry-pages',
    {
      ...query,
      limit: '10',
    },
  );
}

export async function getWebsiteAnalyticsExitPages(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsPage[]>(
    '/website-analytics/exit-pages',
    {
      ...query,
      limit: '10',
    },
  );
}

export async function getWebsiteAnalyticsVisitors(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsVisitorBreakdown[]>(
    '/website-analytics/visitors',
    query,
  );
}

export async function getWebsiteAnalyticsDevices(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsDevice[]>(
    '/website-analytics/devices',
    query,
  );
}

export async function getWebsiteAnalyticsBrowsers(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsBrowser[]>(
    '/website-analytics/browsers',
    query,
  );
}

export async function getWebsiteAnalyticsOperatingSystems(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsOperatingSystem[]>(
    '/website-analytics/operating-systems',
    query,
  );
}

export async function getWebsiteAnalyticsCountries(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsCountry[]>(
    '/website-analytics/locations',
    {
      ...query,
      limit: '20',
    },
  );
}

export async function getWebsiteAnalyticsCities(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsCity[]>(
    '/website-analytics/cities',
    {
      ...query,
      limit: '20',
    },
  );
}

export async function getWebsiteAnalyticsSources(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsTrafficSource[]>(
    '/website-analytics/sources',
    {
      ...query,
      limit: '20',
    },
  );
}

export async function getWebsiteAnalyticsEvents(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsEventType[]>(
    '/website-analytics/events',
    {
      ...query,
      limit: '20',
    },
  );
}

export async function getWebsiteAnalyticsDailyTrend(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsTrend[]>(
    '/website-analytics/trend/daily',
    query,
  );
}

export async function getWebsiteAnalyticsMonthlyTrend(
  query: WebsiteAnalyticsQuery,
) {
  return get<AnalyticsTrend[]>(
    '/website-analytics/trend/monthly',
    query,
  );
}

export async function getWebsiteAnalyticsRealtime() {
  return api.get(
    '/website-analytics/realtime',
  ).then(
    (response) => response.data,
  );
}