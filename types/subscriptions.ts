import type { IdRecord } from './common';
import type { Currency } from './payments';

export type SubscriptionPlan = 'free' | 'regular' | 'vip' | 'premium';
export type SubscriptionEntitlementPlan = SubscriptionPlan | 'anonymous';

export interface Subscription extends IdRecord {
  userId: string;
  email: string;
  plan: Exclude<SubscriptionPlan, 'free'>;
  amount: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  sourceReference?: string;
  expiringReminderSent: boolean;
  expiredNotificationSent: boolean;
}

export interface SubscriptionEntitlements {
  plan: SubscriptionEntitlementPlan;
  advertising: {
    adsEnabled: boolean;
    adFree: boolean;
    adRemovalIncluded: boolean;
  };
}

export type SubscriptionEntitlementsResponse = SubscriptionEntitlements;

export interface SubscriptionStatusResponse {
  plan: SubscriptionPlan;
  subscription: Subscription | null;
  entitlements: SubscriptionEntitlements;
}

export interface UpgradePriceQuote {
  currentPlan: SubscriptionPlan;
  targetPlan: Exclude<SubscriptionPlan, 'free'>;
  currency: Currency;
  regularPrice: number;
  vipPrice: number;
  premiumPrice: number;
  subscriptionDurationDays: 30;
  daysRemaining: number;
  regularDailyPrice: number;
  vipDailyPrice: number;
  premiumDailyPrice: number;
  currentDailyPrice: number;
  targetDailyPrice: number;
  upgradeDailyPrice: number;
  credit: number;
  upgradeCost: number;
  amount: number;
  canUpgrade: boolean;
}

/** The endpoint preserves the VIP quote at the top level and also returns both upgrade tiers. */
export interface UpgradePriceResponse extends UpgradePriceQuote {
  vipUpgrade: UpgradePriceQuote;
  premiumUpgrade: UpgradePriceQuote;
}
