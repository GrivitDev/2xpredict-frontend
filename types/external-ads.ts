export enum ExternalAdFrequency {
  NONE = 'none',
  LOW = 'low',
  NORMAL = 'normal',
}

export type ExternalAdPosition =
  | 'hero'
  | 'banner'
  | 'inline'
  | 'sidebar'
  | 'bottom'
  | 'footer'
  | 'popup'
  | 'ticker'
  | 'interstitial'
  | 'rewarded';

export type ExternalAdProvider =
  | 'google'
  | 'adsterra'
  | 'monetag';

export interface ExternalAdPolicy {
  enabled: boolean;
  showInternalAds: boolean;
  frequency: ExternalAdFrequency;
  aggressive: boolean;
  refreshInterval: number;
  allowPopup: boolean;
  allowInterstitial: boolean;
  allowRewarded: boolean;
}