// src/types/analytics.types.ts


// =====================================================
// USER ANALYTICS
// =====================================================

export interface AnalyticsUsers {
  totalUsers: number;

  activeUsers: number;

  suspendedUsers: number;

  deletedUsers: number;

  verifiedUsers: number;

  unverifiedUsers: number;
}


// =====================================================
// REVENUE ANALYTICS
// =====================================================

export interface AnalyticsRevenue {
  totalRevenue: number;

  vipRevenue: number;

  regularRevenue: number;

  predictionRevenue: number;

  totalPayments: number;

  approvedPayments: number;

  pendingPayments: number;

  rejectedPayments: number;
}


// =====================================================
// SUBSCRIPTION ANALYTICS
// =====================================================

export interface AnalyticsSubscriptions {
  totalSubscriptions: number;

  activeSubscriptions: number;


  vipSubscriptions: number;

  activeVipSubscriptions: number;


  regularSubscriptions: number;

  activeRegularSubscriptions: number;
}


// =====================================================
// PREDICTION ANALYTICS
// =====================================================

export interface AnalyticsPredictions {
  totalPredictions: number;

  vipPredictions: number;

  regularPredictions: number;

  freePredictions: number;


  pendingPredictions: number;

  wonPredictions: number;

  lostPredictions: number;

  voidPredictions: number;
}


// =====================================================
// ADS ANALYTICS
// =====================================================

export interface AnalyticsAds {
  totalAds: number;

  activeAds: number;

  impressions: number;

  clicks: number;

  ctr: number;
}


// =====================================================
// PROMO ANALYTICS
// =====================================================

export interface AnalyticsPromos {
  totalPromos: number;

  activePromos: number;

  expiredPromos: number;
}


// =====================================================
// REFERRAL ANALYTICS
// =====================================================

export interface AnalyticsReferrals {
  totalReferrals: number;

  rewardedReferrals: number;

  pendingRewards: number;
}


// =====================================================
// LEADERBOARD USER
// =====================================================

export interface AnalyticsLeaderboardUser {
  userId: string;

  fullName: string;

  username: string;

  email: string;


  totalSubscriptions?: number;

  totalVipSubscriptions?: number;

  totalRegularSubscriptions?: number;


  totalPurchases?: number;

  totalSpent?: number;


  successfulReferrals?: number;
}


// =====================================================
// LEADERBOARDS
// =====================================================

export interface AnalyticsLeaderboards {

  topSubscribers: AnalyticsLeaderboardUser[];

  topVipSubscribers: AnalyticsLeaderboardUser[];

  topRegularSubscribers: AnalyticsLeaderboardUser[];

  topPredictionBuyers: AnalyticsLeaderboardUser[];

  topReferrers: AnalyticsLeaderboardUser[];
}


// =====================================================
// COMPLETE DASHBOARD RESPONSE
// =====================================================

export interface AnalyticsDashboardResponse {

  users: AnalyticsUsers;

  revenue: AnalyticsRevenue;

  subscriptions: AnalyticsSubscriptions;

  predictions: AnalyticsPredictions;

  ads: AnalyticsAds;

  promos: AnalyticsPromos;

  referrals: AnalyticsReferrals;

  leaderboards: AnalyticsLeaderboards;
}