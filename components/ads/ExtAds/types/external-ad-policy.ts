// external-ads/types/external-ad-policy.ts

export type ExternalAdFrequency =
  | 'NONE'
  | 'LOW'
  | 'NORMAL';

export interface ExternalAdPolicy {
  enabled: boolean;

  showInternalAds: boolean;

  frequency: ExternalAdFrequency;

  aggressive: boolean;

  /**
   * Minimum interval, in seconds, at which
   * the external advertising system may refresh.
   */
  refreshInterval: number;

  allowPopup: boolean;

  allowInterstitial: boolean;

  allowRewarded: boolean;
}