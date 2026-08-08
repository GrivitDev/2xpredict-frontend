'use client';

import { useQuery } from '@tanstack/react-query';

import { getPageAds } from '@/services/ads.service';

import { AdPage } from '@/constants/ads/ad-page';
import { AdDevice } from '@/constants/ads/ad-device';

export function useInternalAds(
  page: AdPage,
  device: AdDevice,
) {
  return useQuery({
    queryKey: [
      'internal-ads',
      page,
      device,
    ],

    queryFn: () =>
      getPageAds(
        page,
        device,
      ),

    retry: false,
  });
}