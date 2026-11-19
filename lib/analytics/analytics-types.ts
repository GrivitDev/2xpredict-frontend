import type { AnalyticsEventInput, WebsiteAnalyticsEventType } from '@/types/analytics';

export type AnalyticsEventType = WebsiteAnalyticsEventType;
export type { AnalyticsEventInput };

export interface QueuedAnalyticsEvent {
  eventId: string;
  visitorId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  eventName: string;
  path: string;
  pageTitle: string;
  url: string;
  properties: Record<string, unknown>;
  occurredAt: string;
  durationMs: number;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  screenWidth: number;
  screenHeight: number;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  userAgent: string;
}

export interface AnalyticsSessionSnapshot {
  visitorId: string;
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
  pageViews: number;
  eventCount: number;
  durationMs: number;
  currentPath: string;
  landingPage: string;
}

export interface AnalyticsClientOptions { apiUrl: string }

