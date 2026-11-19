'use client';

import { useQuery } from '@tanstack/react-query';
import { getPageAds } from '@/services/internal-ads.service';
import type { AdDevice, AdPage, InternalAd } from '@/types/ads';

export function useInternalAds(page: AdPage, device: AdDevice) {
  return useQuery<InternalAd[]>({
    queryKey: ['internal-ads', 'delivery', page, device],
    queryFn: () => getPageAds(page, device),
    staleTime: 60_000,
  });
}
