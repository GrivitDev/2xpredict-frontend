'use client';

import {
  ExternalBannerAd,
  ExternalNativeAd,
  ExternalVideoAd,
  ExternalPopupAd,
  ExternalInterstitialAd,
  ExternalRewardedAd,
} from '../index';

export function HomepageAds() {
  return (
    <>
      <ExternalBannerAd placement="homepage-banner" />

      <ExternalNativeAd placement="homepage-native" />

      <ExternalVideoAd placement="homepage-video" />

      <ExternalPopupAd placement="homepage-popup" />

      <ExternalInterstitialAd placement="homepage-interstitial" />

      <ExternalRewardedAd placement="homepage-rewarded" />
    </>
  );
}