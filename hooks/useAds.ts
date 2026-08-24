'use client';

import {
  useQuery,
  useMutation,
} from '@tanstack/react-query';

import {
  getPageAds,
  getExternalAdPolicy,
  recordAdImpression,
  recordAdClick,
} from '@/services/ads.service';

import {
  AdPage,
} from '@/constants/ads/ad-page';

import {
  AdDevice,
} from '@/constants/ads/ad-device';


// ============================================================
// PUBLIC ADS
// ============================================================


// ============================================================
// GET ADS FOR PAGE
// ============================================================

export function usePageAds(

  page: AdPage,

  device: AdDevice,

) {

  return useQuery({

    queryKey: [
      'page-ads',
      page,
      device,
    ],

    queryFn: () =>
      getPageAds(
        page,
        device,
      ),

  });

}


// ============================================================
// GET EXTERNAL AD POLICY
// ============================================================

export function useExternalAdPolicy() {

  return useQuery({

    queryKey: [
      'external-ad-policy',
    ],

    queryFn:
      getExternalAdPolicy,

  });

}


// ============================================================
// RECORD AD IMPRESSION
// ============================================================

export function useRecordAdImpression() {

  return useMutation({

    mutationFn:
      recordAdImpression,

  });

}


// ============================================================
// RECORD AD CLICK
// ============================================================

export function useRecordAdClick() {

  return useMutation({

    mutationFn:
      recordAdClick,

  });

}