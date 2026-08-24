// ============================================================
// REFERRAL USER
// ============================================================

export interface ReferralUser {

  _id: string;

  username: string;

  email: string;
}


// ============================================================
// REFERRAL
// ============================================================

export interface Referral {

  _id: string;

  referrerId: ReferralUser;

  referredUserId: ReferralUser;

  registered: boolean;

  regularSubscription: boolean;

  vipSubscription: boolean;

  predictionPurchased: boolean;

  rewardClaimed: boolean;

  rewardClaimedAt?: string;

  createdAt: string;

  updatedAt: string;
}


// ============================================================
// REFERRAL STATS
// ============================================================

export interface ReferralStats {

  total: number;

  registered: number;

  regularSubscribers: number;

  vipSubscribers: number;

  predictionPurchases: number;

  rewardClaimed?: number;

  conversionRate: number;
}


// ============================================================
// ADMIN REFERRAL STATS
// ============================================================

export interface ReferralAdminStats {

  total: number;

  totalReferrers: number;

  registered: number;

  regularSubscribers: number;

  vipSubscribers: number;

  predictionPurchases: number;

  conversionRate: number;
}


// ============================================================
// MY REFERRAL LINK
// ============================================================

export interface MyReferralLink {

  referralCode?: string;

  referralLink: string;

  [key: string]: unknown;
}