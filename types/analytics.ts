import type { DateRangeQuery } from '@/types/common';

export interface PublicAnalyticsStats {
  registeredUsers: number;
  subscribers: number;
  marketsPredicted: number;
  totalMarkets: number;
  marketsWon: number;
  matchesPredicted: number;
  activeLeagues: number;
  settledMatches: number;
  updatedAt: string;
}

export interface RevenueBreakdown { NGN: number; USD: number }

export interface AnalyticsUsers {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

export interface AnalyticsRevenue {
  totalRevenue: RevenueBreakdown;
  vipRevenue: RevenueBreakdown;
  regularRevenue: RevenueBreakdown;
  premiumRevenue: RevenueBreakdown;
  totalPayments: number;
  approvedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
}

export interface AnalyticsSubscriptions {
  totalSubscriptions: number;
  activeSubscriptions: number;
  vipSubscriptions: number;
  activeVipSubscriptions: number;
  regularSubscriptions: number;
  activeRegularSubscriptions: number;
  premiumSubscriptions: number;
  activePremiumSubscriptions: number;
}

export interface AnalyticsPredictions {
  totalPredictions: number;
  calculatedMarketPredictions: number;
  partialMarketPredictions: number;
  unavailableMarketPredictions: number;
  failedMarketPredictions: number;
  totalSelections: number;
  pendingSelections: number;
  wonSelections: number;
  lostSelections: number;
  voidSelections: number;
  pushSelections: number;
  halfWonSelections: number;
  halfLostSelections: number;
  totalCuratedPredictions: number;
  readyCuratedPredictions: number;
  publishedCuratedPredictions: number;
  settledCuratedPredictions: number;
  cancelledCuratedPredictions: number;
}

export interface AnalyticsAds {
  totalAds: number;
  activeAds: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface AnalyticsPromos {
  totalPromos: number;
  activePromos: number;
  expiredPromos: number;
}

export interface AnalyticsReferrals {
  totalReferrals: number;
  registeredReferrals: number;
  regularSubscribers: number;
  vipSubscribers: number;
  premiumSubscribers: number;
  paidSubscribers: number;
  rewardedReferrals: number;
  unclaimedReferrals: number;
}

export interface AnalyticsLeaderboardUser {
  userId: string;
  fullName: string;
  username: string;
  email: string;
  totalSubscriptions?: number;
  totalVipSubscriptions?: number;
  totalRegularSubscriptions?: number;
  totalPremiumSubscriptions?: number;
  successfulReferrals?: number;
}

export interface AnalyticsDashboardResponse {
  users: AnalyticsUsers;
  revenue: AnalyticsRevenue;
  subscriptions: AnalyticsSubscriptions;
  predictions: AnalyticsPredictions;
  ads: AnalyticsAds;
  promos: AnalyticsPromos;
  referrals: AnalyticsReferrals;
  leaderboards: {
    topSubscribers: AnalyticsLeaderboardUser[];
    topVipSubscribers: AnalyticsLeaderboardUser[];
    topRegularSubscribers: AnalyticsLeaderboardUser[];
    topPremiumSubscribers: AnalyticsLeaderboardUser[];
    topReferrers: AnalyticsLeaderboardUser[];
  };
}

export type WebsiteAnalyticsEventType =
  | 'page_view' | 'page_exit' | 'session_start' | 'session_end' | 'heartbeat'
  | 'click' | 'link_click' | 'button_click' | 'form_start' | 'form_submit' | 'form_error' | 'input_focus'
  | 'search' | 'filter' | 'tab_change' | 'modal_open' | 'modal_close' | 'dropdown_open' | 'scroll'
  | 'content_view' | 'video_play' | 'video_complete' | 'login' | 'logout' | 'registration' | 'prediction_view'
  | 'subscription_view' | 'subscription_purchase' | 'pricing_view' | 'promo_view' | 'promo_claim'
  | 'referral_view' | 'referral_share' | 'community_view' | 'community_post_create' | 'community_reply_create'
  | 'ad_view' | 'ad_click' | 'error' | 'custom';
export type WebsiteVisitorType = 'anonymous' | 'registered';
export interface WebsiteAnalyticsQuery extends DateRangeQuery { limit?: number | string; page?: number | string; visitorType?: string; eventType?: string; eventName?: string; path?: string }
export interface AnalyticsPage { path: string; views: number; uniqueVisitors: number; [key: string]: unknown }
export interface AnalyticsVisitorBreakdown { visitorType: string; visitors: number; [key: string]: unknown }
export interface AnalyticsDevice { deviceType: string; sessions: number; visitors: number; [key: string]: unknown }
export interface AnalyticsBrowser { browser: string; sessions: number; visitors: number; [key: string]: unknown }
export interface AnalyticsOperatingSystem { operatingSystem: string; sessions: number; visitors: number; [key: string]: unknown }
export interface AnalyticsCountry { country: string; countryCode: string; sessions: number; visitors: number; [key: string]: unknown }
export interface AnalyticsCity { city: string; region: string; country: string; countryCode: string; sessions: number; visitors: number; [key: string]: unknown }
export interface AnalyticsTrafficSource { referrer: string; utmSource: string; utmMedium: string; utmCampaign: string; sessions: number; visitors: number; [key: string]: unknown }
export interface AnalyticsEventSummary { eventType: string; count: number; visitors: number; [key: string]: unknown }
export interface AnalyticsTrend { date?: string; month?: string; hour?: number; events: number; pageViews: number; visitors: number; sessions: number; [key: string]: unknown }
export interface WebsiteAnalyticsOverview {
  visitors: number; sessions: number; activeSessions: number; pageViews: number; events: number;
  totalTimeMs: number; averageSessionDurationMs: number; bounceRate: number; bouncedSessions: number;
  [key: string]: unknown;
}
export interface AnalyticsEventInput {
  eventType: WebsiteAnalyticsEventType;
  eventName?: string; path?: string; pageTitle?: string; url?: string;
  properties?: Record<string, unknown>; durationMs?: number;
}
