export type PromoCampaignType = 'direct' | 'referral';
export type PromoPromotionKind = 'reward' | 'discount' | 'bundle';
export type PromoPurpose = 'general' | 'first_purchase' | 'renewal' | 'win_back' | 'upgrade' | 'referral' | 'seasonal' | 'bulk' | 'bundle';
export type PromoDiscountType = 'percentage' | 'fixed_amount';
export type PromoCurrency = 'NGN' | 'USD';
export type PromoPlan = 'regular' | 'vip' | 'premium';
export type PromoRewardType = 'subscription' | 'bet_lab_points';
export type PromoRequirement = 'register' | 'regular_subscription' | 'vip_subscription' | 'any_subscription' | 'premium_subscription';
export type AccountAgeUnit = 'days' | 'months' | 'years';
export type VerificationStatus = 'any' | 'verified' | 'unverified';
export type SubscriptionEligibilityStatus = 'any' | 'never_subscribed' | 'active' | 'renewal_due' | 'expired';

export interface PromoEligibilityRules {
  accountAge?: { min?: number; max?: number; unit?: AccountAgeUnit };
  verificationStatus?: VerificationStatus;
  subscriptionStatus?: SubscriptionEligibilityStatus;
  previousPlan?: PromoPlan | 'any';
  daysSinceExpiry?: { min?: number; max?: number };
  firstPurchaseOnly?: boolean;
}

export interface Promo extends Record<string, unknown> {
  _id: string;
  name: string;
  description?: string;
  promoCode?: string;
  campaignType: PromoCampaignType;
  promotionKind: PromoPromotionKind;
  purpose: PromoPurpose;
  startDate: string;
  endDate: string;
  isActive: boolean;
  requirement?: PromoRequirement;
  targetCount?: number;
  maxClaims?: number;
  rewardType?: PromoRewardType;
  rewardPlan?: PromoPlan;
  rewardDurationDays?: number;
  pointsAmount?: number;
  discountType?: PromoDiscountType;
  discountValue?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  amountCurrency?: PromoCurrency;
  eligiblePlans?: PromoPlan[];
  eligibilityRules?: PromoEligibilityRules;
  perUserRedemptionLimit?: number;
  totalRedemptionLimit?: number;
  redemptionCount?: number;
  reservedRedemptions?: number;
  eligibilityVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromoPayload {
  name: string;
  campaignType: PromoCampaignType;
  description?: string;
  promoCode?: string;
  promotionKind: PromoPromotionKind;
  purpose: PromoPurpose;
  startDate: string;
  endDate: string;
  requirement?: PromoRequirement;
  targetCount?: number;
  rewardType?: PromoRewardType;
  rewardPlan?: PromoPlan;
  rewardDurationDays?: number;
  pointsAmount?: number;
  discountType?: PromoDiscountType;
  discountValue?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  amountCurrency?: PromoCurrency;
  eligiblePlans?: PromoPlan[];
  eligibilityRules?: PromoEligibilityRules;
  perUserRedemptionLimit?: number;
  totalRedemptionLimit?: number;
  maxClaims?: number;
  isActive?: boolean;
}
export type UpdatePromoPayload = Partial<CreatePromoPayload>;

export interface PromoReward extends Record<string, unknown> {
  _id: string;
  userId?: string | { _id?: string; fullName?: string; username?: string; email?: string };
  promoId?: string | { _id?: string; name?: string; promoCode?: string };
  type?: PromoRewardType;
  rewardType?: PromoRewardType;
  plan?: PromoPlan;
  durationDays?: number;
  pointsAmount?: number;
  points?: number;
  claimNumber?: number;
  status?: string;
  paidAt?: string;
  claimedAt?: string;
  createdAt?: string;
}

export type PromoRedemptionStatus = 'reserved' | 'redeemed' | 'released';
export interface PromoRedemption extends Record<string, unknown> {
  _id: string;
  promoId?: string | { _id?: string; name?: string; promoCode?: string };
  userId?: string | { _id?: string; fullName?: string; username?: string; email?: string };
  paymentId?: string;
  paymentReference?: string;
  status: PromoRedemptionStatus;
  currency: PromoCurrency;
  baseAmount: number;
  discountAmount: number;
  finalAmount?: number;
  pointsReward?: number;
  createdAt?: string;
  redeemedAt?: string;
}

export interface PromoAnalyticsCurrencySummary {
  currency: PromoCurrency;
  redemptionCount?: number;
  reservedCount?: number;
  redeemedCount?: number;
  releasedCount?: number;
  baseAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}
export interface PromoAnalytics {
  promoId?: string;
  totalPromos?: number;
  redemptionCount?: number;
  reservedCount?: number;
  redeemedCount?: number;
  releasedCount?: number;
  reserved?: number;
  redeemed?: number;
  released?: number;
  pointsAwarded?: number;
  byCurrency?: PromoAnalyticsCurrencySummary[] | Record<PromoCurrency, { grossValue?: number; discountCost?: number; netSubscriptionValue?: number; baseAmount?: number; discountAmount?: number; finalAmount?: number }>;
  [key: string]: unknown;
}
export interface PromoClaimPayload { promoCode: string }
export interface PromoClaimResponse { success?: boolean; message?: string; claim?: unknown; [key: string]: unknown }

/** Response item returned by GET /promos/my-progress for joined active referral campaigns. */
export interface PromoReferralProgress {
  promoId: string;
  name: string;
  description?: string;
  requirement?: PromoRequirement;
  rewardType?: PromoRewardType;
  rewardPlan?: PromoPlan;
  pointsAmount?: number;
  rewardDurationDays?: number;
  targetCount: number;
  maxClaims: number;
  qualifiedReferrals: number;
  currentProgress: number;
  remainingToNextReward: number;
  completedClaims: number;
  remainingClaims: number | null;
  completed: boolean;
  unlimited: boolean;
}
