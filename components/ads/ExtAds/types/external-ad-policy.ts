export type ExternalAdFrequency = 'NONE' | 'LOW' | 'NORMAL';
export type ExternalAdType = 'BANNER' | 'INTERSTITIAL' | 'NATIVE' | 'REWARDED' | 'POPUP' | 'STICKY' | 'VIDEO';
export type ExternalAdAudience = 'GUEST' | 'FREE' | 'REGULAR' | 'VIP' | 'PREMIUM';
export interface ExternalAdPolicy {
  enabled: boolean; audiences: Record<ExternalAdAudience, boolean>; frequency: ExternalAdFrequency;
  refreshIntervalSeconds: number; maxImpressionsPerSession: number; maxImpressionsPerDay: number;
  allowedTypes: Record<ExternalAdType, boolean>; allowBanner: boolean; allowNative: boolean; allowInterstitial: boolean;
  allowPopup: boolean; allowRewarded: boolean; allowSticky: boolean; allowVideo: boolean;
  /** Backwards-compatible fields for provider manager only. Never used to gate in-app campaign ads. */
  showInternalAds: boolean; aggressive: boolean; refreshInterval: number;
}
