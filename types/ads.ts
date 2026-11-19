export type Id = string;
export type AdAudience = 'ALL' | 'GUEST' | 'FREE' | 'REGULAR' | 'VIP' | 'PREMIUM';
export type AdAudienceKey = Exclude<AdAudience, 'ALL'>;
export type AdType = 'BANNER' | 'INTERSTITIAL' | 'NATIVE' | 'REWARDED' | 'POPUP' | 'STICKY' | 'VIDEO';
export type AdContentSource = 'CUSTOM' | 'PREDICTION' | 'SLIP' | 'SURE_ODDS' | 'PROMO' | 'BONUS' | 'REFERRAL' | 'SUBSCRIPTION' | 'BET_LAB';
export type AdPage = 'HOME' | 'DASHBOARD' | 'PRICING' | 'PREDICTIONS' | 'ABOUT' | 'PURCHASES' | 'SUBSCRIPTIONS' | 'REFERRALS' | 'BET_LAB' | 'PICK_CENTER' | 'SLIP_CENTER' | 'ODDS_CENTER' | 'BONUSES' | 'PROMOS' | 'WALLET' | 'REGISTER' | 'LOGIN';
export type AdPosition = 'POPUP' | 'HERO' | 'TOP_BANNER' | 'INLINE' | 'SIDEBAR_LEFT' | 'SIDEBAR_RIGHT' | 'BOTTOM' | 'FOOTER' | 'INTERSTITIAL' | 'STICKY_BOTTOM' | 'STICKY_TOP' | 'FEED';
export type AdDevice = 'ALL' | 'MOBILE' | 'TABLET' | 'DESKTOP';
export type AdTrigger = 'ALWAYS' | 'EVERY_VISIT' | 'FIRST_VISIT' | 'ON_LOGIN' | 'ON_REFRESH' | 'ONCE_PER_SESSION' | 'ONCE_PER_DAY';
export type AdTriggerEvent = 'VISIT' | 'LOGIN' | 'REFRESH';
export type AdEventType = 'IMPRESSION' | 'CLICK' | 'CONVERSION' | 'DISMISS';
export type AdAutomationKey = 'TOP_PREDICTION' | 'TODAYS_SURE_ODDS' | 'FEATURED_SLIP' | 'AVAILABLE_BONUS' | 'ACTIVE_PROMO' | 'REFERRAL_CAMPAIGN' | 'SUBSCRIPTION_OFFER' | 'BET_LAB_WELCOME_POINTS';
export type ExternalAdFrequency = 'NONE' | 'LOW' | 'NORMAL';
export type AdMediaType = 'IMAGE' | 'VIDEO';

export interface AdImage { url: string; publicId: string; width: number; height: number; format: string; bytes: number }
export interface AdMedia { url: string; type: AdMediaType; publicId?: string; posterUrl?: string; mimeType?: string; durationSeconds?: number; autoplay?: boolean; muted?: boolean; loop?: boolean }
export interface AdAction { label: string; url: string }
export interface AdDisplay {
  page: AdPage; position: AdPosition; trigger: AdTrigger; device: AdDevice; fixed: boolean; displayOrder: number;
  width?: number; height?: number; widthPercent?: number; maxWidthPercent?: number; maxWidth?: number; maxHeight?: number;
  aspectRatio?: string; objectFit?: 'contain' | 'cover' | 'fill';
}
export interface AdTargeting { allowedPlans?: AdAudienceKey[]; excludedPlans?: AdAudienceKey[]; requireAuthenticated?: boolean; guestsOnly?: boolean }
export interface AdContentVisibility {
  showProbability?: boolean; showConfidence?: boolean; showMarketName?: boolean; showMarketSelections?: boolean;
  showFairOdds?: boolean; showBookmakerOdds?: boolean; showDecimalOdds?: boolean; showCombinedOdds?: boolean;
  showCombinedProbability?: boolean; showLegCount?: boolean; showTeams?: boolean; showLeague?: boolean;
  showFixtureDate?: boolean; showProductName?: boolean; showRewardValue?: boolean; showPromoCode?: boolean;
  showDescription?: boolean; showSportyBetCode?: boolean; showSelectionCount?: boolean;
  showSubscriptionPricing?: boolean; showWelcomePoints?: boolean;
}
export type AdContentVisibilityByAudience = Partial<Record<AdAudienceKey, AdContentVisibility>>;
export interface AdminAd {
  _id: Id; title: string; subTitle?: string; description?: string; instructions?: string[]; image?: AdImage; media?: AdMedia;
  actions?: AdAction[]; displays: AdDisplay[]; type: AdType; contentSource: AdContentSource; sourceId?: string;
  contentVisibility?: AdContentVisibilityByAudience; design?: Record<string, unknown>; targeting?: AdTargeting;
  priority: number; audience: AdAudience[]; isActive: boolean; automated: boolean; automationKey?: AdAutomationKey;
  maxImpressionsPerVisitorPerDay?: number; startDate?: string | null; endDate?: string | null;
  impressions: number; clicks: number; conversions?: number; createdAt?: string; updatedAt?: string;
  createdBy?: { _id: string; fullName?: string; username?: string; email?: string };
  updatedBy?: { _id: string; fullName?: string; username?: string; email?: string };
}
export type CreateAdPayload = Omit<AdminAd, '_id' | 'impressions' | 'clicks' | 'conversions' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
export type UpdateAdPayload = Partial<CreateAdPayload>;
export interface AdsListQuery {
  search?: string; page?: number; limit?: number; active?: boolean; type?: AdType; contentSource?: AdContentSource;
  audience?: AdAudience; displayPage?: AdPage; position?: AdPosition; device?: AdDevice;
}
export interface Pagination { page: number; limit: number; total: number; pages: number }
export interface Paginated<T> { items: T[]; pagination: Pagination }
export interface AdAnalyticsQuery { startDate?: string; endDate?: string; days?: number }
export interface AdEventQuery {
  page?: number; limit?: number; startDate?: string; endDate?: string; type?: AdEventType; audience?: AdAudience; adPage?: AdPage; position?: AdPosition;
  device?: AdDevice; adId?: string; conversionType?: string;
}
export interface AdEventRecord {
  _id: string; adId: string | { _id: string; title?: string; type?: AdType; contentSource?: AdContentSource };
  type: AdEventType; eventKey: string; visitorKeyHash?: string; sessionKeyHash?: string; audience?: AdAudience; page?: AdPage;
  position?: AdPosition; device?: AdDevice; conversionType?: string; conversionValue?: number; currency?: 'NGN' | 'USD';
  metadata?: Record<string, unknown>; createdAt?: string;
}
export interface AdAnalytics {
  totalAds: number; activeAds: number; impressions: number; clicks: number; conversions: number; dismissals: number;
  ctr: number; conversionRate: number; conversionValueByCurrency?: Array<{ _id: string; events: number; value: number }>;
  events?: Array<{ _id: string; count: number }>; byType?: Array<{ _id: string; count: number }>;
  byDay?: Array<{ _id: string; impressions: number; clicks: number; conversions: number; dismissals?: number }>;
  byPosition?: Array<Record<string, unknown>>; byAudience?: Array<Record<string, unknown>>; byPage?: Array<Record<string, unknown>>;
  byDevice?: Array<Record<string, unknown>>; topAds?: Array<{ adId: string; title?: string; type?: AdType; impressions: number; clicks: number; conversions: number }>;
  range?: { startDate?: string; endDate?: string; days?: number } | string;
}
export interface AdCampaignAnalytics {
  ad: Pick<AdminAd, '_id' | 'title' | 'type' | 'contentSource' | 'createdAt' | 'impressions' | 'clicks' | 'conversions'>;
  adId: string; impressions: number; clicks: number; conversions: number; dismissals: number; ctr: number; conversionRate: number;
  conversionValueByCurrency?: Array<{ _id: string; events: number; value: number }>;
  events?: Array<{ _id: string; count: number; conversionValue?: number }>; byType?: Array<{ _id: string; count: number; conversionValue?: number }>;
  byDay?: Array<{ _id: string; impressions: number; clicks: number; conversions: number; dismissals?: number }>;
  byAudience?: Array<Record<string, unknown>>; byPosition?: Array<Record<string, unknown>>; byPage?: Array<Record<string, unknown>>; byDevice?: Array<Record<string, unknown>>;
  range?: { startDate?: string; endDate?: string; timezone?: string };
}

export interface AutomationOption { key: AdAutomationKey; source: AdContentSource; title: string; resolves?: string }
export interface DiscoveredAdContent { source: AdContentSource; sourceId?: string; title: string; subTitle?: string; description?: string; destinationUrl?: string; defaultActionLabel?: string; [key: string]: unknown }
export interface DiscoverContentResponse { items: DiscoveredAdContent[]; total: number; generatedAt: string; automationOptions: AutomationOption[] }
export interface AdPreviewResponse { available: boolean; audience: AdAudienceKey; ad?: Partial<AdminAd>; content: Record<string, unknown> | null }
export interface ExternalAdPolicy {
  key?: string; enabled: boolean; audiences: Record<AdAudienceKey, boolean>; frequency: ExternalAdFrequency;
  refreshIntervalSeconds: number; maxImpressionsPerSession: number; maxImpressionsPerDay: number;
  allowedTypes: Record<AdType, boolean>; allowBanner?: boolean; allowNative?: boolean; allowInterstitial?: boolean;
  allowPopup?: boolean; allowRewarded?: boolean; allowSticky?: boolean; allowVideo?: boolean; updatedBy?: string;
  /** Legacy provider compatibility. External policy never governs in-app campaigns. */
  showInternalAds?: boolean; aggressive?: boolean; refreshInterval?: number;
}
export interface AdPolicyResponse { external: ExternalAdPolicy & { enabledForCurrentAudience: boolean; configuredEnabled?: boolean; audience: AdAudienceKey } }
export interface PublicAd extends Partial<AdminAd> { _id: string; title: string; content?: Record<string, unknown>; display?: AdDisplay[] }

/* Separately-managed platform-owned internal ads. */
export type DisplayLevel = 'high' | 'medium' | 'low';
export type InternalAdPlacement = 'WEB' | 'TELEGRAM';
export interface InternalAd {
  _id: string; title: string; subtitle?: string; message?: string; description?: string[]; instructions?: string[];
  actions?: AdAction[]; image?: string; placements?: InternalAdPlacement[]; displayLevel?: DisplayLevel; sortOrder?: number; priority?: number;
  isActive: boolean; startDate?: string; endDate?: string; lastTelegramSentAt?: string | null; lastTelegramMessageId?: number | null;
  impressions?: number; clicks?: number; displays?: AdDisplay[];
}
/** Mirrors backend/src/internal-ads/dto/create-internal-ad.dto.ts. */
export interface CreateInternalAdPayload {
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
export type UpdateInternalAdPayload = Partial<CreateInternalAdPayload>;

export interface TrackAdEventPayload { type: AdEventType; eventKey: string; visitorKey?: string; sessionKey?: string; placement?: string; page?: AdPage; position?: AdPosition; device?: AdDevice; conversionType?: string; conversionValue?: number; currency?: 'NGN' | 'USD'; metadata?: Record<string, unknown> }

