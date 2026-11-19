import type { BonusStatus, BonusType } from './bonuses';
import type { AdAction, DisplayLevel, InternalAdPlacement } from './ads';

// Auth DTOs (backend/src/auth/dto).
export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  referralCode?: string;
  promoCode?: string;
}

export interface RequestEmailChangeDto {
  currentPassword: string;
  newEmail: string;
}

export interface RequestPasswordResetBody {
  email: string;
}

export interface ResetPasswordBody {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailChangeDto {
  code: string;
}

// Bonuses DTOs (backend/src/bonuses/dto).
export interface BonusQueryDto {
  userId?: string;
  type?: BonusType;
  status?: BonusStatus | 'EXPIRED';
  page?: number;
  limit?: number;
}

export type BonusRecipientPlan = 'free' | 'regular' | 'vip' | 'premium';

export interface BulkGrantPointsBonusDto {
  points: number;
  reason: string;
  idempotencyKey: string;
  userIds?: string[];
  recipientPlan?: BonusRecipientPlan;
}

export interface BulkGrantSubscriptionBonusDto {
  plan: 'regular' | 'vip' | 'premium';
  durationDays: number;
  reason: string;
  idempotencyKey: string;
  startsAt?: string;
  userIds?: string[];
  recipientPlan?: BonusRecipientPlan;
}

export interface GrantPointsBonusDto {
  userId: string;
  points: number;
  reason: string;
  idempotencyKey: string;
}

export interface GrantSubscriptionBonusDto {
  userId: string;
  plan: 'regular' | 'vip' | 'premium';
  durationDays: number;
  reason: string;
  idempotencyKey: string;
  startsAt?: string;
}

export interface RevokeBonusDto {
  reason: string;
}

// Internal Ads DTOs (backend/src/internal-ads/dto).
export interface CreateInternalAdDto {
  title: string;
  subtitle?: string;
  message?: string;
  description?: string[];
  instructions?: string[];
  actions?: AdAction[];
  image?: string;
  placements?: InternalAdPlacement[];
  displayLevel?: DisplayLevel;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export type UpdateInternalAdDto = Partial<CreateInternalAdDto>;

// OTP DTOs (backend/src/otp/dto).
export interface ResendOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}

// Users DTO (backend/src/users/users.controller.ts).
export interface UpdateProfileBody {
  fullName?: string;
  username?: string;
  phoneNumber?: string;
}

// Website Analytics DTOs (backend/src/website-analytics/dto).
export type AnalyticsEventType =
  | 'page_view' | 'page_exit' | 'session_start' | 'session_end' | 'heartbeat'
  | 'click' | 'link_click' | 'button_click' | 'form_start' | 'form_submit'
  | 'form_error' | 'input_focus' | 'search' | 'filter' | 'tab_change'
  | 'modal_open' | 'modal_close' | 'dropdown_open' | 'scroll' | 'content_view'
  | 'video_play' | 'video_complete' | 'login' | 'logout' | 'registration'
  | 'prediction_view' | 'subscription_view' | 'subscription_purchase'
  | 'pricing_view' | 'promo_view' | 'promo_claim' | 'referral_view'
  | 'referral_share' | 'community_view' | 'community_post_create'
  | 'community_reply_create' | 'ad_view' | 'ad_click' | 'error' | 'custom';

export interface TrackEventDto {
  visitorId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  eventName: string;
  path: string;
  pageTitle?: string;
  url?: string;
  properties?: Record<string, unknown>;
  occurredAt: string;
  durationMs?: number;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  screenWidth?: number;
  screenHeight?: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  userAgent?: string;
  eventId: string;
}

export interface TrackEventsDto {
  events: TrackEventDto[];
}

export type AnalyticsVisitorType = 'anonymous' | 'registered';

export interface TrackSessionDto {
  visitorId: string;
  sessionId: string;
  visitorType?: AnalyticsVisitorType;
  timestamp: string;
  durationMs?: number;
  activeTimeMs?: number;
  path?: string;
  landingPage?: string;
  exitPage?: string;
  pageViews?: number;
  eventCount?: number;
  isActive?: boolean;
  bounced?: boolean;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  screenWidth?: number;
  screenHeight?: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
}

export interface EndSessionBody {
  sessionId: string;
  visitorId?: string;
  timestamp?: string;
  path?: string;
  durationMs?: number;
  activeTimeMs?: number;
  pageViews?: number;
  eventCount?: number;
  bounced?: boolean;
}

/** Browser payment initialization contract aligned with the backend DTO. */
export interface InitializePaymentDto {
  gateway: 'paystack';
  type: 'subscription' | 'vip_upgrade' | 'premium_upgrade';
  target: string;
  promoCode?: string;
}

export interface RebuildCalibrationBody { marketKey?: string }
export interface SyncQueueBody { force?: boolean }
export interface UpdateSportyBetBody { sportyBetSlipCode?: string | null; sportyBetSlipLink?: string | null; adminId?: string }
