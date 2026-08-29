export type AnalyticsEventType =
  | 'page_view'
  | 'page_exit'
  | 'session_start'
  | 'session_end'
  | 'heartbeat'
  | 'click'
  | 'link_click'
  | 'button_click'
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'input_focus'
  | 'search'
  | 'filter'
  | 'tab_change'
  | 'modal_open'
  | 'modal_close'
  | 'dropdown_open'
  | 'scroll'
  | 'content_view'
  | 'video_play'
  | 'video_complete'
  | 'login'
  | 'logout'
  | 'registration'
  | 'prediction_view'
  | 'prediction_purchase'
  | 'subscription_view'
  | 'subscription_purchase'
  | 'pricing_view'
  | 'promo_view'
  | 'promo_claim'
  | 'referral_view'
  | 'referral_share'
  | 'community_view'
  | 'community_post_create'
  | 'community_reply_create'
  | 'ad_view'
  | 'ad_click'
  | 'error'
  | 'custom';

export type AnalyticsVisitorType =
  | 'anonymous'
  | 'registered';

export interface AnalyticsEventInput {
  eventType: AnalyticsEventType;
  eventName?: string;

  path?: string;
  pageTitle?: string;
  url?: string;

  properties?: Record<string, unknown>;

  durationMs?: number;
}

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

export interface AnalyticsClientOptions {
  apiUrl: string;
}