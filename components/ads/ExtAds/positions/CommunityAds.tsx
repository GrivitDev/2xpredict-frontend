'use client';

import {
  ExternalBannerAd,
  ExternalNativeAd,
  ExternalVideoAd,
  ExternalPopupAd,
  ExternalInterstitialAd,
  ExternalRewardedAd,
} from '../index';

export function CommunityAds() {
  return (
    <>
      <ExternalBannerAd placement="community-banner" />

      <ExternalNativeAd placement="community-native" />

      <ExternalVideoAd placement="community-video" />

      <ExternalPopupAd placement="community-popup" />

      <ExternalInterstitialAd placement="community-interstitial" />

      <ExternalRewardedAd placement="community-rewarded" />
    </>
  );
}