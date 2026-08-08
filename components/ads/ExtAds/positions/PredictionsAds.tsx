'use client';

import {
  ExternalBannerAd,
  ExternalNativeAd,
  ExternalPopupAd,
  ExternalInterstitialAd,
  ExternalRewardedAd,
} from '../index';

export function PredictionsAds() {
  return (
    <>
      <ExternalBannerAd placement="predictions-banner" />

      <ExternalNativeAd placement="predictions-native" />

      <ExternalPopupAd placement="predictions-popup" />

      <ExternalInterstitialAd placement="predictions-interstitial" />

      <ExternalRewardedAd placement="predictions-rewarded" />
    </>
  );
}