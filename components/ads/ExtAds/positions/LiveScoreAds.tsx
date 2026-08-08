'use client';

import {
  ExternalBannerAd,
  ExternalNativeAd,
  ExternalVideoAd,
  ExternalPopupAd,
  ExternalInterstitialAd,
  ExternalRewardedAd,
} from '../index';

export function LiveScoreAds() {
  return (
    <>
      <ExternalBannerAd placement="live-score-banner" />

      <ExternalNativeAd placement="live-score-native" />

      <ExternalVideoAd placement="live-score-video" />

      <ExternalPopupAd placement="live-score-popup" />

      <ExternalInterstitialAd placement="live-score-interstitial" />

      <ExternalRewardedAd placement="live-score-rewarded" />
    </>
  );
}