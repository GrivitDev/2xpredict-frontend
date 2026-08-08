'use client';

import {
  ExternalBannerAd,
  ExternalNativeAd,
  ExternalVideoAd,
  ExternalPopupAd,
  ExternalInterstitialAd,
  ExternalRewardedAd,
} from '../index';

export function ContentAds() {
  return (
    <>
      <ExternalBannerAd placement="content-banner" />

      <ExternalNativeAd placement="content-native" />

      <ExternalVideoAd placement="content-video" />

      <ExternalPopupAd placement="content-popup" />

      <ExternalInterstitialAd placement="content-interstitial" />

      <ExternalRewardedAd placement="content-rewarded" />
    </>
  );
}