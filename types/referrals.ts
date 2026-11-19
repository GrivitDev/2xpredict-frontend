import type { IdRecord } from '@/types/common';

export interface ReferralUser { _id: string; fullName?: string; username?: string; email?: string }
export interface Referral extends IdRecord {
  referrerId: ReferralUser | string;
  referredUserId: ReferralUser | string;
  registered: boolean;
  regularSubscription: boolean;
  vipSubscription: boolean;
  premiumSubscription: boolean;
  rewardClaimed: boolean;
  rewardClaimedAt?: string;
}
export interface ReferralStats {
  total: number;
  totalReferrers?: number;
  registered: number;
  regularSubscribers: number;
  vipSubscribers: number;
  premiumSubscribers?: number;
  paidSubscribers?: number;
  conversionRate?: number;
}
export interface ReferralAdminStats extends ReferralStats { totalReferrers: number }
export interface MyReferralLink { referralCode: string; referralUrl: string }
