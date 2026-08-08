// src/constants/analytics.constants.ts


import {
  Users,
  CreditCard,
  Crown,
  Target,
  TrendingUp,
  Megaphone,
  Gift,
  UserPlus,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';


// =====================================================
// TYPES
// =====================================================

export type AnalyticsCardConfig = {

  key: string;

  title: string;

  description?: string;

  icon: any;

  highlight?: boolean;
};



// =====================================================
// PLATFORM OVERVIEW CARDS
// =====================================================

export const ANALYTICS_OVERVIEW_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'totalUsers',
    title: 'Total Users',
    description: 'Registered users',
    icon: Users,
  },


  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    description: 'Approved payments',
    icon: TrendingUp,
    highlight: true,
  },


  {
    key: 'totalSubscriptions',
    title: 'Total Subscriptions',
    description: 'All subscription plans',
    icon: CreditCard,
  },


  {
    key: 'totalPredictions',
    title: 'Total Predictions',
    description: 'Created predictions',
    icon: Target,
  },

];



// =====================================================
// REVENUE CARDS
// =====================================================

export const ANALYTICS_REVENUE_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'vipRevenue',
    title: 'VIP Revenue',
    description: 'VIP subscriptions and upgrades',
    icon: Crown,
    highlight: true,
  },


  {
    key: 'regularRevenue',
    title: 'Regular Revenue',
    description: 'Regular subscriptions',
    icon: CreditCard,
  },


  {
    key: 'predictionRevenue',
    title: 'Prediction Revenue',
    description: 'Prediction purchases',
    icon: Target,
  },

];



// =====================================================
// SUBSCRIPTION CARDS
// =====================================================

export const ANALYTICS_SUBSCRIPTION_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'activeSubscriptions',
    title: 'Active Subscriptions',
    description: 'Currently active',
    icon: CheckCircle,
    highlight: true,
  },


  {
    key: 'activeVipSubscriptions',
    title: 'Active VIP',
    description: 'VIP members',
    icon: Crown,
  },


  {
    key: 'activeRegularSubscriptions',
    title: 'Active Regular',
    description: 'Regular members',
    icon: Users,
  },

];



// =====================================================
// PREDICTION RESULT CARDS
// =====================================================

export const ANALYTICS_RESULT_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'wonPredictions',
    title: 'Won Predictions',
    icon: CheckCircle,
    highlight: true,
  },


  {
    key: 'lostPredictions',
    title: 'Lost Predictions',
    icon: XCircle,
  },


  {
    key: 'voidPredictions',
    title: 'Void Predictions',
    icon: ShieldAlert,
  },

];



// =====================================================
// PREDICTION ACCESS CARDS
// =====================================================

export const ANALYTICS_ACCESS_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'freePredictions',
    title: 'Free Predictions',
    icon: Target,
  },


  {
    key: 'regularPredictions',
    title: 'Regular Predictions',
    icon: Users,
  },


  {
    key: 'vipPredictions',
    title: 'VIP Predictions',
    icon: Crown,
    highlight: true,
  },

];



// =====================================================
// MARKETING CARDS
// =====================================================

export const ANALYTICS_MARKETING_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'totalAds',
    title: 'Total Ads',
    icon: Megaphone,
  },


  {
    key: 'activeAds',
    title: 'Active Ads',
    icon: Megaphone,
    highlight: true,
  },


  {
    key: 'totalPromos',
    title: 'Total Promos',
    icon: Gift,
  },


  {
    key: 'activePromos',
    title: 'Active Promos',
    icon: Gift,
    highlight: true,
  },

];



// =====================================================
// REFERRAL CARDS
// =====================================================

export const ANALYTICS_REFERRAL_CARDS: AnalyticsCardConfig[] = [

  {
    key: 'totalReferrals',
    title: 'Total Referrals',
    icon: UserPlus,
  },


  {
    key: 'rewardedReferrals',
    title: 'Rewarded Referrals',
    icon: CheckCircle,
  },


  {
    key: 'pendingRewards',
    title: 'Pending Rewards',
    icon: ShieldAlert,
  },

];