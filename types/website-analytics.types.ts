export interface WebsiteAnalyticsOverview {
  visitors: number;
  uniqueVisitorDays: number;
  registeredUniqueVisitorDays: number;
  anonymousUniqueVisitorDays: number;
  sessions: number;
  activeSessions: number;
  pageViews: number;
  events: number;
  totalTimeMs: number;
  totalActiveTimeMs: number;
  averageSessionDurationMs: number;
  averageActiveSessionTimeMs: number;
  bounceRate: number;
  bouncedSessions: number;
  registeredEvents: number;
  anonymousEvents: number;
  conversions: number;
}

export interface WebsiteAnalyticsCountRow {
  name: string;
  count: number;
}

export interface WebsiteAnalyticsVisitorBreakdown {
  visitorType: 'registered' | 'anonymous' | string;
  visitors: number;
}

export interface WebsiteAnalyticsPageRow {
  path: string;
  views: number;
  uniqueVisitors: number;
  pageViews?: number;
  averageTimeMs?: number;
}

export interface WebsiteAnalyticsDailyRow {
  date: string;
  events: number;
  pageViews: number;
  sessions: number;
  endedSessions: number;
  bouncedSessions: number;
  uniqueVisitors: number;
  registeredUniqueVisitors: number;
  anonymousUniqueVisitors: number;
  totalActiveTimeMs: number;
  conversions: number;
}

export interface WebsiteAnalyticsRealtimeEvent {
  eventId?: string;
  eventName: string;
  eventType?: string;
  path: string;
  visitorType?: string;
  occurredAt: string;
}

export interface WebsiteAnalyticsRealtime {
  activeVisitors: number;
  registeredVisitors: number;
  anonymousVisitors: number;
  recentEvents: WebsiteAnalyticsRealtimeEvent[];
}

export interface WebsiteAnalyticsDashboardResponse {
  overview: WebsiteAnalyticsOverview;
  visitors: WebsiteAnalyticsVisitorBreakdown[];
  pages: WebsiteAnalyticsPageRow[];
  technology: {
    devices: WebsiteAnalyticsCountRow[];
    browsers: WebsiteAnalyticsCountRow[];
    operatingSystems: WebsiteAnalyticsCountRow[];
  };
  geography: {
    countries: WebsiteAnalyticsCountRow[];
  };
  traffic: {
    sources: WebsiteAnalyticsCountRow[];
  };
  events: WebsiteAnalyticsCountRow[];
}

export interface WebsiteAnalyticsVisitorTypes {
  newVisitors: number;
  returningVisitors: number;
  totalVisitors: number;
}

export interface WebsiteAnalyticsConversions {
  conversions: number;
  visitors: number;
  conversionRate: number;
}

export interface WebsiteAnalyticsHourlyTrend {
  hour: number;
  events: number;
}
