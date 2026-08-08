'use client';

import {
  ExternalBannerAd,
  ExternalPopupAd,
  ExternalInterstitialAd,
} from '../index';

export function DashboardAds() {
  return (
    <>
      <ExternalBannerAd placement="dashboard-banner" />

      <ExternalPopupAd placement="dashboard-popup" />

      <ExternalInterstitialAd placement="dashboard-interstitial" />
    </>
  );
}